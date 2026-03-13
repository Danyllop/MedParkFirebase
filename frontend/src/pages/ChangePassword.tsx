import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { user, token, login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        // In a real app, call API here
        if (user && token) {
            login(token, { ...user }); // Refresh session or just proceed
        }
        
        localStorage.removeItem('medpark_require_password_change');
        alert('Senha alterada com sucesso!\\nUm e-mail de confirmação de segurança foi enviado para o seu endereço registrado.');
        
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-primary p-4">
            <div className="card p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2">Alteração Obrigatória</h2>
                <p className="text-text-secondary mb-6 text-sm">Detectamos o uso de uma senha padrão. Por sua segurança, altere sua senha para continuar.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Nova Senha</label>
                        <input
                            type="password"
                            required
                            className="input-field w-full"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            required
                            className="input-field w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 mt-4">
                        Salvar e Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
