import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Image, MessageSquare, Calendar, ArrowRight } from 'lucide-react';

const HERO_IMAGE = 'https://mgx-backend-cdn.metadl.com/generate/images/1255717/2026-05-20/o5agddyaagta/hero-banner-ai-content-generation.png';

export default function Index() {
  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/20 via-transparent to-[#FF6B6B]/10" />
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold font-['Poppins'] leading-tight">
                Contenido{' '}
                <span className="bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B] bg-clip-text text-transparent">
                  Automático
                </span>{' '}
                para tu Negocio
              </h1>
              <p className="text-lg text-gray-300 max-w-lg">
                Genera posts, flyers, captions y campañas completas con inteligencia artificial. 
                Diseñado para bienes raíces, abogados, clínicas, talleres, iglesias y emprendedores en Panamá.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 py-6 text-lg rounded-xl">
                    Comenzar Gratis <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#6C63FF]/30 to-[#FF6B6B]/30 rounded-3xl blur-2xl" />
              <img
                src={HERO_IMAGE}
                alt="AI Content Generation"
                className="relative rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#1A1A2E]">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-4">
              Todo lo que Necesitas
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Herramientas potenciadas por IA para crear contenido profesional en segundos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MessageSquare, title: 'Posts', desc: 'Genera textos atractivos para redes sociales con un solo clic.' },
              { icon: Image, title: 'Flyers', desc: 'Crea diseños visuales impactantes para promociones y eventos.' },
              { icon: Sparkles, title: 'Captions', desc: 'Obtén captions creativos y hashtags relevantes al instante.' },
              { icon: Calendar, title: 'Campañas', desc: 'Planifica una semana completa de contenido automáticamente.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-[#6C63FF]/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center mb-4 group-hover:bg-[#6C63FF]/30 transition-colors">
                  <feature.icon className="h-6 w-6 text-[#6C63FF]" />
                </div>
                <h3 className="text-lg font-semibold font-['Poppins'] mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gradient-to-b from-[#1A1A2E] to-[#12122A]">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-4">
              Diseñado para tu Industria
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Contenido especializado para cada tipo de negocio.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Bienes Raíces', image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?w=400', gradient: 'from-[#6C63FF]/40 to-[#4834d4]/30' },
{ name: 'Abogados', image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?w=400', gradient: 'from-[#2d3436]/60 to-[#636e72]/30' },
{ name: 'Clínicas', image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?w=400', gradient: 'from-[#00b894]/40 to-[#00cec9]/30' },
{ name: 'Talleres', image: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=400', gradient: 'from-[#e17055]/40 to-[#d63031]/30' },
{ name: 'Iglesias', image: 'https://images.pexels.com/photos/208216/pexels-photo-208216.jpeg?w=400', gradient: 'from-[#a29bfe]/40 to-[#6c5ce7]/30' },
{ name: 'Emprendedores', image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=400', gradient: 'from-[#FF6B6B]/40 to-[#ee5a24]/30' },
{ name: 'Restaurantes', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400', gradient: 'from-[#f9ca24]/40 to-[#f0932b]/30' },
{ name: 'Barberías', image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?w=400', gradient: 'from-[#6ab04c]/40 to-[#badc58]/30' },
{ name: 'Gym', image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?w=400', gradient: 'from-[#e84393]/40 to-[#be2edd]/30' },
            ].map((industry) => (
              <div
                key={industry.name}
                className="group relative overflow-hidden rounded-2xl border border-gray-700/50 hover:border-[#FF6B6B]/50 transition-all duration-300"
              >
             <div className="aspect-[4/3] overflow-hidden">
  <div className="w-full h-full relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
    <img src={industry.image} alt={industry.name} className="w-full h-full object-cover absolute inset-0" />
    <div className={`absolute inset-0 bg-gradient-to-br ${industry.gradient} opacity-40`} />
  </div>
</div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-lg font-semibold font-['Poppins']">{industry.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-[#12122A]">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-4">
              Plan Simple, Resultados Poderosos
            </h2>
          </div>
          <div className="max-w-md mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#6C63FF]/10 to-[#FF6B6B]/5 border border-[#6C63FF]/30 text-center space-y-6">
              <div className="inline-block px-4 py-1 rounded-full bg-[#6C63FF]/20 text-[#6C63FF] text-sm font-medium">
                Plan Mensual
              </div>
              <div className="space-y-1">
                <span className="text-5xl font-bold font-['Poppins']">$29</span>
                <span className="text-gray-400">/mes</span>
              </div>
              <ul className="space-y-3 text-left text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-[#6C63FF]" />
                  </div>
                  Posts ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-[#6C63FF]" />
                  </div>
                  Generación de flyers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-[#6C63FF]" />
                  </div>
                  Planificación de campañas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-[#6C63FF]" />
                  </div>
                  Soporte prioritario
                </li>
              </ul>
              <Link to="/dashboard">
                <Button className="w-full bg-[#6C63FF] hover:bg-[#5A52E0] text-white py-6 text-lg rounded-xl mt-4">
                  Empezar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0D0D1A] border-t border-gray-800">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xl font-bold font-['Poppins'] bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B] bg-clip-text text-transparent">
              Social Auto PTY
            </span>
            <p className="text-gray-500 text-sm">
              © 2026 Social Auto PTY. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}