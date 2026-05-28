import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu, X } from 'lucide-react';
import { client } from '@/lib/api';

export default function Header() {
  const [user, setUser] = useState<unknown>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) {
          setUser(res.data);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    client.auth.toLogin();
  };

  const handleLogout = async () => {
    await client.auth.logout();
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Posts', path: '/generator/post' },
    { label: 'Flyers', path: '/generator/flyer' },
    { label: 'Campañas', path: '/generator/campaign' },
    { label: 'Historial', path: '/history' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#1A1A2E]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1A2E]/80">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-['Poppins'] bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B] bg-clip-text text-transparent">
            Social Auto PTY
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-[#6C63FF]/20 hover:bg-[#6C63FF]/30">
                  <User className="h-5 w-5 text-[#6C63FF]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1A1A2E] border-gray-700">
                <DropdownMenuItem onClick={handleLogout} className="text-gray-300 hover:text-white cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white">
              Iniciar Sesión
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A1A2E] border-t border-gray-800 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block text-sm font-medium text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="text-sm text-gray-300 hover:text-white flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Cerrar Sesión
            </button>
          ) : (
            <Button onClick={handleLogin} className="w-full bg-[#6C63FF] hover:bg-[#5A52E0] text-white">
              Iniciar Sesión
            </Button>
          )}
        </div>
      )}
    </header>
  );
}