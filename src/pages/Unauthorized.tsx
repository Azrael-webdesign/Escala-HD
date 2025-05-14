
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-2">Acesso Negado</h1>
        <p className="text-xl mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate(user?.role === "admin" ? "/admin" : "/employee")}>
            Ir para a página inicial
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
