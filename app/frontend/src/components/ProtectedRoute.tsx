import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { client } from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) {
          setUser(res.data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1A2E]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C63FF]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1A2E]">
        <div className="text-center space-y-6 p-8 rounded-2xl bg-[#1A1A2E] border border-gray-800 max-w-md mx-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
            <Lock className="h-8 w-8 text-[#6C63FF]" />
          </div>
          <h2 className="text-2xl font-bold text-white font-['Poppins']">
            Acceso Requerido
          </h2>
          <p className="text-gray-400">
            Necesitas iniciar sesión para acceder a esta sección.
          </p>
          <Button
            onClick={() => client.auth.toLogin()}
            className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}