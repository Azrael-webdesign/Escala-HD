
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { getCurrentUser, login as loginService, logout as logoutService } from "@/services/mockData";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = loginService(email, password);
      
      if (user) {
        setUser(user);
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo(a), ${user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Falha no login",
          description: "Email ou senha inválidos",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer login",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    navigate("/login");
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
