import { createContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'participant' | 'facilitator';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, role: 'participant' | 'facilitator') => Promise<void>;
  logout: () => void;
  allUsers: User[];
  loadAllUsers: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.token) {
            try {
              const response = await authAPI.getCurrentUser();
              setUser(response.user);
            } catch (error) {
              console.error('Error loading user:', error);
              localStorage.removeItem('user');
            }
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();
    loadAllUsers(); // Load all users when the app starts
  }, []);

  const loadAllUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setAllUsers(response.users || []);
    } catch (error) {
      console.error('Error loading all users:', error);
    }
  };

  const login = async (email: string) => {
    try {
      const response = await authAPI.login(email);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify({
        token: response.token,
        user: response.user
      }));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, role: 'participant' | 'facilitator') => {
    try {
      const response = await authAPI.register(name, email, role);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify({
        token: response.token,
        user: response.user
      }));
      await loadAllUsers();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout, 
      allUsers,
      loadAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};
