import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
{ value: 'bienes_raices', label: 'Bienes Raíces' },
{ value: 'abogados', label: 'Abogados' },
{ value: 'clinicas', label: 'Clínicas' },
{ value: 'talleres', label: 'Talleres' },
{ value: 'iglesias', label: 'Iglesias' },
{ value: 'emprendedores', label: 'Emprendedores' },
{ value: 'restaurantes', label: 'Restaurantes' },
{ value: 'barberias', label: 'Peluquerías/Barberías' },
{ value: 'gym', label: 'Gym' },
];

const TONES = [
  { value: 'profesional', label: 'Profesional' },
  { value: 'casual', label: 'Casual' },
  { value: 'divertido', label: 'Divertido' },
  { value: 'urgente', label: 'Urgente' },
];

function PostGeneratorContent() {
  const [searchParams] = useSearchParams();
  const [businessType, setBusinessType] = useState(searchParams.get('business') || '');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('profesional');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!businessType || !topic) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setResult('');

    const systemPrompt = `Eres un experto en marketing digital para negocios en Panamá. Genera contenido para redes sociales en español.`;
    const userPrompt = `Genera un post para redes sociales para un negocio tipo "${businessType}" sobre el tema: "${topic}". El tono debe ser ${tone}. Incluye emojis relevantes y 3-5 hashtags. El post debe ser atractivo y generar engagement.`;

    try {
      await client.ai.gentxt({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'gpt-5.4',
        stream: true,
        onChunk: (chunk) => {
          if (chunk.content) {
            setResult((prev) => prev + chunk.content);
          }
        },
        onComplete: async (finalResult) => {
          setLoading(false);
          try {
            await client.entities.generated_contents.create({
              data: {
                content_type: 'post',
                business_type: businessType,
                prompt: topic,
                result_text: finalResult.content,
                title: `Post: ${topic.substring(0, 50)}`,
              },
            });
          } catch {
            // Silent save failure
          }
        },
        onError: (error) => {
          setLoading(false);
          toast.error(error?.message || 'Error al generar el post');
        },
      });
    } catch {
      setLoading(false);
      toast.error('Error al conectar con el servicio de IA');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Poppins'] text-white mb-2">Generador de Posts</h1>
          <p className="text-gray-400">Crea posts atractivos para tus redes sociales con IA.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6 p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Negocio</label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Selecciona tu negocio" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-gray-700">
                  {BUSINESS_TYPES.map((bt) => (
                    <SelectItem key={bt.value} value={bt.value} className="text-gray-300">
                      {bt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tema o Descripción</label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Promoción de almuerzo ejecutivo, nuevo corte de cabello..."
                className="bg-gray-800/50 border-gray-700 text-white min-h-[120px] placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tono</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-gray-700">
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-gray-300">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#6C63FF] hover:bg-[#5A52E0] text-white py-6 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando...
                </>
              ) : (
                'Generar Post'
              )}
            </Button>
          </div>

          {/* Result */}
          <div className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white font-['Poppins']">Resultado</h3>
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-white">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <div className="min-h-[300px] rounded-xl bg-gray-900/50 p-4">
              {result ? (
                <p className="text-gray-200 whitespace-pre-wrap">{result}</p>
              ) : (
                <p className="text-gray-500 italic">Tu post generado aparecerá aquí...</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PostGenerator() {
  return (
    <ProtectedRoute>
      <PostGeneratorContent />
    </ProtectedRoute>
  );
}