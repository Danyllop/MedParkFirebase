import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'SUPERVISOR' | 'OPERADOR';
    mustChangePassword?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Ao detectar um usuário autenticado no Firebase, buscamos os dados adicionais (como role) no Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            id: firebaseUser.uid,
                            name: userData.fullName || firebaseUser.displayName || 'Usuário',
                            email: firebaseUser.email || '',
                            role: userData.role || 'OPERADOR',
                            mustChangePassword: userData.mustChangePassword
                        });
                    } else {
                        // Fallback se o documento no Firestore ainda não existir
                        setUser({
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || 'Usuário',
                            email: firebaseUser.email || '',
                            role: 'OPERADOR'
                        });
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário no Firestore:", error);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

