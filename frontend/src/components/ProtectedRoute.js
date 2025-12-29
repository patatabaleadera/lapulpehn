import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('[ProtectedRoute] Verificando acceso - loading:', loading, 'user:', !!user);
    
    if (!loading && !user) {
      console.log('[ProtectedRoute] Usuario no autenticado, redirigiendo a /');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-stone-700 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después del loading, no renderizar nada (se redirigirá)
  if (!user) {
    return null;
  }

  console.log('[ProtectedRoute] Usuario autenticado, mostrando contenido protegido');
  return children;
};

export default ProtectedRoute;
