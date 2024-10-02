import { useContext, createContext, useState, ReactNode } from "react";

type AuthContextValue = {
  token: string;
  updateToken(token: string): void;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState("");

  const updateToken = (newToken: string) => setToken(newToken);

  const value: AuthContextValue = {
    token,
    updateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("You should use <AuthProvider> to access useAuth()");
  }

  return context;
};
