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

const DURATIONS = [
  { value: '1_semana', label: '1 Semana' },
  { value: '2_semanas', label: '2 Semanas' },
  { value: '1_mes', label: '1 Mes' },
];

function CampaignPlannerContent() {
  const [searchParams] = useSearchParams();
  const [businessType, setBusinessType] = useState(searchParams.get('business') || '');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('1_semana');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!businessType || !goal) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setResult('');

    const systemPrompt = `Eres un estratega de marketing digital especializado en negocios locales en Panamá. Crea planes de contenido detallados y accionables en español.`;
    const userPrompt = `Crea un plan de campaña de contenido para redes sociales para un negocio tipo "${businessType}". 
Objetivo de la campaña: ${goal}
Duración: ${duration.replace('_', ' ')}

Genera un plan día por día que incluya:
- Tipo de contenido (post, story, reel, etc.)
- Texto sugerido para cada publicación
- Mejor horario para publicar
- Hashtags recomendados
- Tips de engagement

Formatea el plan de manera clara y organizada.`;

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
                content_type: 'campaign',
                business_type: businessType,
                prompt: goal,
                result_text: finalResult.content,
                title: `Campaña: ${goal.substring(0, 50)}`,
              },
            });
          } catch {
            // Silent save failure
          }
        },
        onError: (error) => {
          setLoading(false);
          toast.error(error?.message || 'Error al generar la campaña');
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
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Poppins'] text-white mb-2">Planificador de Campañas</h1>
          <p className="text-gray-400">Planifica una campaña completa de contenido con IA.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6 p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50 h-fit">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Objetivo de la Campaña</label>
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ej: Aumentar seguidores, promocionar nuevo menú, atraer clientes nuevos..."
                className="bg-gray-800/50 border-gray-700 text-white min-h-[120px] placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duración</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-gray-700">
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value} className="text-gray-300">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#4ECDC4] hover:bg-[#3DBDB5] text-white py-6 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Planificando...
                </>
              ) : (
                'Generar Plan de Campaña'
              )}
            </Button>
          </div>

          {/* Result */}
          <div className="lg:col-span-3 p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white font-['Poppins']">Plan de Campaña</h3>
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-white">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <div className="min-h-[500px] rounded-xl bg-gray-900/50 p-4 overflow-y-auto max-h-[700px]">
              {result ? (
                <p className="text-gray-200 whitespace-pre-wrap">{result}</p>
              ) : (
                <p className="text-gray-500 italic">Tu plan de campaña aparecerá aquí...</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CampaignPlanner() {
  return (
    <ProtectedRoute>
      <CampaignPlannerContent />
    </ProtectedRoute>
  );
}