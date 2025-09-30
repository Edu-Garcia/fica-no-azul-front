import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      const userId = parseInt(storedUserId);
      authAPI.me(userId)
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('user_id');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await authAPI.login({ email, password });
      setUser(userData);
      localStorage.setItem('user_id', userData.id.toString());
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${userData.name}!`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.response?.data?.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await authAPI.register({ name, email, password });
      toast({
        title: "Conta criada com sucesso!",
        description: "Agora você pode fazer login.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.response?.data?.message || "Erro ao criar conta.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_id');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const contextValue = { user, isLoading, login, register, logout };
  
  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};