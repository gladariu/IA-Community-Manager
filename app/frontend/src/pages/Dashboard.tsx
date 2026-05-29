import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Image, Calendar } from 'lucide-react';

const BUSINESS_TYPES = [
{ value: 'bienes_raices', label: 'Bienes Raíces' },
{ value: 'abogados', label: 'Abogados' },
{ value: 'clinicas', label: 'Clínicas' },
{ value: 'talleres', label: 'Talleres' },
{ value: 'iglesias', label: 'Iglesias' },
{ value: 'emprendedores', label: 'Emprendedores' },
{ value: 'restaurantes', label: 'Restaurantes' },
{ value: 'barberias', label: 'Barberías' },
{ value: 'gym', label: 'Gym' },
];

function DashboardContent() {
  const navigate = useNavigate();
  const [businessType, setBusinessType] = useState('');

  const contentTypes = [
    {
      icon: MessageSquare,
      title: 'Generar Post',
      desc: 'Crea textos atractivos para tus redes sociales.',
      path: '/generator/post',
      color: '#6C63FF',
    },
    {
      icon: Image,
      title: 'Generar Flyer',
      desc: 'Diseña flyers profesionales para tus promociones.',
      path: '/generator/flyer',
      color: '#FF6B6B',
    },
    {
      icon: Calendar,
      title: 'Planificar Campaña',
      desc: 'Planifica una semana completa de contenido.',
      path: '/generator/campaign',
      color: '#4ECDC4',
    },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-['Poppins'] text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Selecciona tu tipo de negocio y el contenido que deseas crear.</p>
        </div>

        <div className="mb-10 max-w-sm">
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Negocio</label>
          <Select value={businessType} onValueChange={setBusinessType}>
            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
              <SelectValue placeholder="Selecciona tu negocio" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A2E] border-gray-700">
              {BUSINESS_TYPES.map((bt) => (
                <SelectItem key={bt.value} value={bt.value} className="text-gray-300 hover:text-white">
                  {bt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {contentTypes.map((ct) => (
            <div
              key={ct.title}
              className="p-6 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-opacity-100 transition-all duration-300 group"
              style={{ '--hover-color': ct.color } as React.CSSProperties}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: `${ct.color}20` }}
              >
                <ct.icon className="h-7 w-7" style={{ color: ct.color }} />
              </div>
              <h3 className="text-xl font-semibold font-['Poppins'] text-white mb-2">{ct.title}</h3>
              <p className="text-gray-400 text-sm mb-6">{ct.desc}</p>
              <Button
                onClick={() => navigate(`${ct.path}${businessType ? `?business=${businessType}` : ''}`)}
                className="w-full text-white rounded-xl"
                style={{ backgroundColor: ct.color }}
              >
                Crear
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}