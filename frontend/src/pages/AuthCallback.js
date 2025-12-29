import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Evitar procesar múltiples veces
    if (processing) return;
    setProcessing(true);

    const handleAuth = async () => {
      try {
        console.log('[AuthCallback] ===== INICIO DEL PROCESO DE AUTH =====');
        console.log('[AuthCallback] URL completa:', window.location.href);
        console.log('[AuthCallback] Hash:', window.location.hash);
        
        // Extraer session_id del hash de la URL
        const hash = window.location.hash.substring(1); // quitar el #
        console.log('[AuthCallback] Hash sin #:', hash);
        
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        console.log('[AuthCallback] Session ID extraído:', sessionId ? sessionId.substring(0, 15) + '...' : 'NULL');

        if (!sessionId) {
          console.error('[AuthCallback] ERROR: No se encontró session_id en la URL');
          toast.error('Error: No se recibió información de autenticación');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        console.log('[AuthCallback] Llamando a login()...');
        const user = await login(sessionId);

        if (!user) {
          console.error('[AuthCallback] ERROR: login() retornó null');
          toast.error('Error al procesar la autenticación');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        console.log('[AuthCallback] Usuario autenticado exitosamente:', user);
        console.log('[AuthCallback] user_type:', user.user_type);

        // Redirigir según el tipo de usuario
        if (!user.user_type) {
          console.log('[AuthCallback] Usuario nuevo, redirigiendo a /select-type');
          navigate('/select-type', { replace: true });
        } else if (user.user_type === 'pulperia') {
          console.log('[AuthCallback] Pulpería autenticada, redirigiendo a /dashboard');
          toast.success(`¡Bienvenido de vuelta, ${user.name}!`);
          navigate('/dashboard', { replace: true });
        } else {
          console.log('[AuthCallback] Cliente autenticado, redirigiendo a /map');
          toast.success(`¡Bienvenido de vuelta, ${user.name}!`);
          navigate('/map', { replace: true });
        }

        console.log('[AuthCallback] ===== FIN DEL PROCESO DE AUTH (ÉXITO) =====');
      } catch (error) {
        console.error('[AuthCallback] ===== ERROR EN EL PROCESO DE AUTH =====');
        console.error('[AuthCallback] Error completo:', error);
        console.error('[AuthCallback] Error message:', error.message);
        console.error('[AuthCallback] Error response:', error.response);
        toast.error('Error al iniciar sesión. Por favor intenta nuevamente.');
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }
    };

    handleAuth();
  }, []); // Solo ejecutar una vez al montar

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-950">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 border-4 border-red-300/30 rounded-full animate-spin border-t-red-100"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-pulse border-t-orange-300"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Iniciando sesión...</h2>
        <p className="text-red-100/70">Por favor espera un momento</p>
      </div>
    </div>
  );
};

export default AuthCallback;
