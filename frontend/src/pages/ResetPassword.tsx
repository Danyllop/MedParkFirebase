import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error('As novas senhas não coincidem!');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/auth/reset-password', {
                email,
                currentPassword,
                newPassword
            });

            toast.success('Senha alterada com sucesso! Verifique seu e-mail.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            const message = err.response?.data?.error || 'Erro ao alterar senha. Verifique as informações.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="font-sans bg-mesh text-slate-100 min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[440px] flex flex-col items-center">
                {/* Logo Section */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="bg-accent p-2 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined notranslate text-white text-3xl">local_parking</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white leading-none">MedPark</h1>
                    </div>
                </div>

                {/* Reset Card */}
                <div className="glass-card w-full rounded-xl shadow-2xl p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-semibold text-white">Alterar Senha</h2>
                        <p className="text-sm text-slate-400">Insira suas informações para redefinir sua senha</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">Email de Usuário</label>
                            <input
                                className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                type="email"
                                placeholder="exemplo@medpark.pt"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Current Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">Senha Atual</label>
                            <input
                                className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                type={showPasswords ? "text" : "password"}
                                placeholder="Senha atual"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* New Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">Nova Senha</label>
                            <input
                                className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                type={showPasswords ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Confirm New Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">Confirmar Nova Senha</label>
                            <input
                                className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                type={showPasswords ? "text" : "password"}
                                placeholder="Confirme a nova senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="show"
                                className="w-4 h-4 rounded bg-slate-900/50 border-slate-700 text-accent"
                                checked={showPasswords}
                                onChange={() => setShowPasswords(!showPasswords)}
                            />
                            <label htmlFor="show" className="text-xs text-slate-400 cursor-pointer">Mostrar senhas</label>
                        </div>

                        <button
                            className="w-full btn-primary py-3 px-4 shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processando...' : 'Atualizar Senha'}
                        </button>

                        <Link to="/login" className="text-center text-xs text-slate-500 hover:text-white transition-colors">
                            Voltar para o Login
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
