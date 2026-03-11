import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulate login logic
        if (password === 'Mud@1234') {
            login({
                id: '1',
                name: 'Novo Usuário',
                email: email,
                role: 'ADMIN' // Default for this demo logic, but usually it would depend.
            });
            // Armazena flag indicando que precisa de troca de senha
            localStorage.setItem('medpark_require_password_change', 'true');
            navigate('/change-password');
            return;
        }

        login({
            id: '1',
            name: 'Admin MedPark',
            email: email,
            role: 'ADMIN'
        });

        navigate('/');
    };

    return (
        <div className="font-sans bg-mesh text-slate-100 min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[440px] flex flex-col items-center">
                {/* Logo Section */}
                <div className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="bg-accent p-2 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined notranslate text-white text-3xl">local_parking</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white leading-none">MedPark</h1>
                    </div>
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent/80">Gestão Hospitalar</p>
                </div>

                {/* Login Card */}
                <div className="glass-card w-full rounded-xl shadow-2xl p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-semibold text-white">Aceder ao Painel</h2>
                        <p className="text-sm text-slate-400">Insira as suas credenciais para acessar o painel</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300" htmlFor="email">Email de Acesso</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                    <span className="material-symbols-outlined notranslate text-xl">mail</span>
                                </div>
                                <input
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                    id="email"
                                    type="email"
                                    placeholder="exemplo@medpark.pt"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300" htmlFor="password">Palavra-passe</label>
                                <button type="button" className="text-xs font-medium text-accent hover:text-accent/80 transition-colors cursor-pointer">
                                    Esqueceu a senha?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                    <span className="material-symbols-outlined notranslate text-xl">lock</span>
                                </div>
                                <input
                                    className="block w-full pl-11 pr-11 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined notranslate text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2">
                            <input
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-accent focus:ring-accent/50 focus:ring-offset-slate-900"
                                id="remember"
                                type="checkbox"
                            />
                            <label className="text-xs text-slate-400 cursor-pointer" htmlFor="remember">Manter sessão iniciada</label>
                        </div>

                        {/* Action Button */}
                        <button
                            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                            type="submit"
                        >
                            <span>Acessar o Painel</span>
                            <span className="material-symbols-outlined notranslate text-lg">arrow_forward</span>
                        </button>
                    </form>
                </div>

                {/* Support / Help */}
                <div className="mt-8 flex gap-6">
                    <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer">
                        <span className="material-symbols-outlined notranslate text-sm">help</span> Suporte Técnico
                    </button>
                    <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer">
                        <span className="material-symbols-outlined notranslate text-sm">security</span> Segurança
                    </button>
                </div>

                {/* Footer */}
                <footer className="mt-16 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 font-medium">
                        Desenvolvido por <span className="text-slate-400">LogUp Solutions</span>
                    </p>
                </footer>
            </div>

            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
                <div className="absolute top-[10%] right-[15%] w-64 h-64 bg-accent/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]"></div>
            </div>
        </div>
    );
};

export default Login;
