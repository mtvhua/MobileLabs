// =============================================================================
// AUTH CONTEXT - Module 5: Event Pass Pro
// =============================================================================
// Contexto global de autenticación que gestiona el estado del usuario.
//
// ## Conceptos Clave
// 1. **Context API**: Permite compartir estado (user) en toda la app sin "prop drilling".
// 2. **onAuthStateChanged**: Listener de tiempo real de Firebase que detecta login/logout.
// 3. **Sync de Cookies**: Sincronizamos el token de Firebase con cookies para futuras
//    integraciones con Middleware de Next.js.
// =============================================================================

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => { },
  signInWithEmail: async () => { },
  registerWithEmail: async () => { },
  resetPassword: async () => { },
  logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Suscripción al estado de autenticación de Firebase
    // Se ejecuta automáticamente cuando el usuario inicia o cierra sesión
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // Educational Note: Cookie Sync
      // Guardamos el token en una cookie para que el servidor (Next.js Middleware)
      // pueda verificar la sesión si fuera necesario en el futuro.
      if (user) {
        const token = await user.getIdToken();
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Strict`;
      } else {
        document.cookie = 'firebase-auth-token=; path=/; max-age=0; SameSite=Strict';
      }
      setLoading(false);
    });

    // Cleanup function: Desuscribirse al desmontar
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/events');
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Cookie is handled by onAuthStateChanged
      router.push('/events');
    } catch (error) {
      console.error('Error signing in with email', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.push('/events');
    } catch (error) {
      console.error('Error registering', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Cookie is handled by onAuthStateChanged
      router.push('/');
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      registerWithEmail,
      resetPassword,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
