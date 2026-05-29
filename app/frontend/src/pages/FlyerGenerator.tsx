import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
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

const STYLES = [
  { value: 'moderno', label: 'Moderno' },
  { value: 'minimalista', label: 'Minimalista' },
  { value: 'vibrante', label: 'Vibrante' },
  { value: 'elegante', label: 'Elegante' },
];

function FlyerGeneratorContent() {
  const [searchParams] = useSearchParams();
  const [businessType, setBusinessType] = useState(searchParams.get('business') || '');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('moderno');
  const [resultImage, setResultImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!businessType || !description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setResultImage('');

    const prompt = `Create a professional social media flyer for a ${businessType} business in Panama. The flyer is about: ${description}. Style: ${style}. Include bold text, vibrant colors, and a modern layout. The text should be in Spanish. Make it eye-catching and suitable for Instagram or Facebook.`;

    try {
      const response = await client.ai.genimg(
        { prompt, model: 'dall-e-3', size: '1024x1024' },
        { timeout: 600000 }
      );

      const imageUrl = response?.data?.images?.[0];
      if (imageUrl) {
        setResultImage(imageUrl);
        try {
          await client.entities.generated_contents.create({
            data: {
              content_type: 'flyer',
              business_type: businessType,
              prompt: description,
              result_image_url: imageUrl,
              title: `Flyer: ${description.substring(0, 50)}`,
            },
          });
        } catch {
          // Silent save failure
        }
      } else {
        toast.error('No se pudo generar la imagen');
      }
    } catch {
      toast.error('Error al generar el flyer');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      window.open(resultImage, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Poppins'] text-white mb-2">Generador de Flyers</h1>
          <p className="text-gray-400">Crea flyers profesionales para tus promociones con IA.</p>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción del Evento/Promoción</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Noche de 2x1 en cócteles, Gran apertura con 20% de descuento..."
                className="bg-gray-800/50 border-gray-700 text-white min-h-[120px] placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estilo</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-gray-700">
                  {STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-gray-300">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#FF6B6B] hover:bg-[#E55A5A] text-white py-6 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando Flyer...
                </>
              ) : (
                'Generar Flyer'
              )}
            </Button>
          </div>

          {/* Result */}
          <div className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white font-['Poppins']">Resultado</h3>
              {resultImage && (
                <Button variant="ghost" size="sm" onClick={handleDownload} className="text-gray-400 hover:text-white">
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="min-h-[400px] rounded-xl bg-gray-900/50 flex items-center justify-center overflow-hidden">
              {loading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-[#FF6B6B] mx-auto" />
                  <p className="text-gray-400">Generando tu flyer... esto puede tomar un momento.</p>
                </div>
              ) : resultImage ? (
                <img src={resultImage} alt="Flyer generado" className="w-full h-auto rounded-lg" />
              ) : (
                <p className="text-gray-500 italic">Tu flyer generado aparecerá aquí...</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FlyerGenerator() {
  return (
    <ProtectedRoute>
      <FlyerGeneratorContent />
    </ProtectedRoute>
  );
}
