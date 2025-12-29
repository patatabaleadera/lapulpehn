import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

console.log('[AuthContext] Inicializando con BACKEND_URL:', BACKEND_URL);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función simple para verificar autenticación
  const checkAuth = useCallback(async () => {
    try {
      console.log('[AuthContext] Verificando autenticación...');
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
        timeout: 15000
      });
      
      console.log('[AuthContext] Usuario autenticado:', response.data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.log('[AuthContext] No hay sesión activa');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función simple para login
  const login = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      console.log('[AuthContext] Iniciando login con session_id:', sessionId.substring(0, 15) + '...');
      console.log('[AuthContext] URL del backend:', `${BACKEND_URL}/api/auth/session`);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/session`,
        { session_id: sessionId },
        { 
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[AuthContext] Login exitoso, datos del usuario:', response.data);
      setUser(response.data);
      toast.success('¡Bienvenido!');
      return response.data;
    } catch (error) {
      console.error('[AuthContext] Error en login:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función simple para logout
  const logout = useCallback(async () => {
    try {
      console.log('[AuthContext] Cerrando sesión...');
      await axios.post(
        `${BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('[AuthContext] Error en logout:', error);
    } finally {
      setUser(null);
      toast.success('Sesión cerrada');
    }
  }, []);

  // Verificar auth al montar
  useEffect(() => {
    console.log('[AuthContext] Montando AuthProvider, verificando auth inicial...');
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
