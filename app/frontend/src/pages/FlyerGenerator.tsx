import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2, Upload } from 'lucide-react';
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
  const [logo, setLogo] = useState('');
  const [finalImage, setFinalImage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const overlayLogoOnImage = (flyer: string, logoSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      const flyerImg = new Image();
      flyerImg.crossOrigin = 'anonymous';
      flyerImg.onload = () => {
        ctx.drawImage(flyerImg, 0, 0, 1024, 1024);

        const logoImg = new Image();
        logoImg.onload = () => {
          const maxWidth = 280;
          const maxHeight = 130;
          const margin = 16;

          // Maintain aspect ratio
          let w = logoImg.width;
          let h = logoImg.height;
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = w * ratio;
          h = h * ratio;

          // Place logo in bottom right corner
          const x = 1024 - w - margin;
          const y = 1024 - h - margin;

          ctx.drawImage(logoImg, x, y, w, h);
          resolve(canvas.toDataURL('image/png'));
        };
        logoImg.src = logoSrc;
      };
      flyerImg.src = flyer;
    });
  };

  const handleGenerate = async () => {
    if (!businessType || !description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setResultImage('');
    setFinalImage('');

    const logoAspect = logo ? (() => {
      const img = new Image();
      img.src = logo;
      const ratio = img.naturalWidth / img.naturalHeight || 2.5;
      return ratio > 1.5 ? 'wide horizontal rectangular' : ratio < 0.8 ? 'tall vertical rectangular' : 'square';
    })() : 'rectangular';

    const prompt = `Professional social media flyer for ${businessType} business in Panama. Topic: ${description}. Style: ${style}. Spanish text, vibrant colors, modern layout, suitable for Instagram. Fill entire canvas. No text in bottom-right corner (10% of image) - that area must match the background naturally for logo placement.`;


    try {
      const response = await client.ai.genimg(
        { prompt, model: 'gpt-image-2', size: '1024x1024' },
        { timeout: 600000 }
      );

      const imageUrl = response?.data?.images?.[0];
      if (imageUrl) {
        setResultImage(imageUrl);

        if (logo) {
          const combined = await overlayLogoOnImage(imageUrl, logo);
          setFinalImage(combined);
        } else {
          setFinalImage(imageUrl);
        }

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
    const src = finalImage || resultImage;
    if (src) {
      const link = document.createElement('a');
      link.href = src;
      link.download = 'flyer.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const displayImage = finalImage || resultImage;

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Poppins'] text-white mb-2">Generador de Flyers</h1>
          <p className="text-gray-400">Crea flyers profesionales para tus promociones con IA.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo (opcional) {logo && <span className="text-green-400 ml-2">✓ Cargado</span>}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setLogo(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300 cursor-pointer hover:border-[#FF6B6B] transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {logo ? 'Cambiar logo' : 'Subir logo'}
                </label>
                {logo && (
                  <img src={logo} alt="Logo" className="h-12 w-12 object-contain rounded bg-white p-1" />
                )}
              </div>
              {logo && (
                <p className="text-xs text-gray-500 mt-1">El logo se añadirá automáticamente al flyer generado.</p>
              )}
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

          <div className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white font-['Poppins']">Resultado</h3>
              {displayImage && (
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
              ) : displayImage ? (
                <img src={displayImage} alt="Flyer generado" className="w-full h-auto rounded-lg" />
              ) : (
                <p className="text-gray-500 italic">Tu flyer generado aparecerá aquí...</p>
              )}
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
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