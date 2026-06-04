import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare, Image, Calendar, Loader2, Copy, Download, Check } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

interface ContentItem {
  id: number;
  content_type: string;
  business_type: string;
  title: string;
  result_text?: string;
  result_image_url?: string;
  created_at: string;
}

function HistoryContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      const response = await client.entities.generated_contents.query({
        query: {},
        sort: '-created_at',
        limit: 50,
      });
      setItems((response?.data?.items as ContentItem[]) || []);
    } catch {
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await client.entities.generated_contents.delete({ id: String(id) });
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Contenido eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copiado al portapapeles');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title || 'flyer'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="h-4 w-4" />;
      case 'flyer':
        return <Image className="h-4 w-4" />;
      case 'campaign':
        return <Calendar className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'post':
        return 'bg-[#6C63FF]/20 text-[#6C63FF]';
      case 'flyer':
        return 'bg-[#FF6B6B]/20 text-[#FF6B6B]';
      case 'campaign':
        return 'bg-[#4ECDC4]/20 text-[#4ECDC4]';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Poppins'] text-white mb-2">Historial</h1>
          <p className="text-gray-400">Todo tu contenido generado en un solo lugar.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#6C63FF]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No tienes contenido generado aún.</p>
            <p className="text-gray-500 mt-2">Comienza creando un post, flyer o campaña.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(item.content_type)}`}>
                        {getTypeIcon(item.content_type)}
                        {item.content_type === 'post' ? 'Post' : item.content_type === 'flyer' ? 'Flyer' : 'Campaña'}
                      </span>
                      <span className="text-xs text-gray-500">{item.business_type}</span>
                    </div>
                    <h3 className="text-white font-medium truncate">{item.title || 'Sin título'}</h3>
                    {item.result_text && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.result_text}</p>
                    )}
                    {item.result_image_url && (
                      <img
                        src={item.result_image_url}
                        alt="Flyer"
                        className="mt-3 w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <p className="text-gray-500 text-xs mt-2">{formatDate(item.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Copiar post */}
                    {item.result_text && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(item.result_text!, item.id)}
                        className="text-gray-500 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10"
                        title="Copiar texto"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    {/* Descargar flyer */}
                    {item.result_image_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(item.result_image_url!, item.title)}
                        className="text-gray-500 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10"
                        title="Descargar flyer"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Eliminar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function History() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
