import React, { useState, useEffect } from 'react';
import type { User } from '../../pages/Users';
import { useAuth } from '../../store/AuthContext';

interface UserFormProps {
    initialData?: User;
    onSave: (data: Partial<User>) => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSave, onCancel }) => {
    const { user: currentUser } = useAuth();
    const isSupervisor = currentUser?.role === 'SUPERVISOR';

    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        cpf: '',
        email: '',
        role: 'Operador',
        status: 'ATIVO'
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (field: keyof User, value: string) => {
        let formattedValue = value;

        // Máscara e upper case
        if (field === 'name') {
            formattedValue = value.toUpperCase();
        }

        if (field === 'cpf') {
            // Apenas números
            formattedValue = value.replace(/\D/g, '');
            // 000.000.000-00
            formattedValue = formattedValue.replace(/(\d{3})(\d)/, '$1.$2');
            formattedValue = formattedValue.replace(/(\d{3})(\d)/, '$1.$2');
            formattedValue = formattedValue.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }

        if (field === 'email') {
            formattedValue = value.toLowerCase();
        }

        setFormData(prev => ({ ...prev, [field]: formattedValue }));
    };

    // Simulação simples de Hash criptográfico (ex: SHA-256 / bcrypt hash no frontend para demonstração)
    const mockHashPassword = (pwd: string) => {
        return btoa(pwd + "_salt_medpark_2026");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!initialData) {
            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }
            if (password.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres.');
                return;
            }
        }
        
        const finalData = { ...formData };
        if (password) {
            // Em aplicação real isso não ficaria visível, mas adicionamos no objeto gravado no BD.
            (finalData as any).passwordHash = mockHashPassword(password);
        }

        onSave(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full sm:min-w-[500px]">
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                    <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-accent/50 focus:bg-slate-900 transition-colors text-white"
                        placeholder="NOME COMPLETO"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CPF</label>
                    <input
                        type="text"
                        required
                        maxLength={14}
                        value={formData.cpf || ''}
                        onChange={(e) => handleChange('cpf', e.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-accent/50 focus:bg-slate-900 transition-colors text-white font-mono"
                        placeholder="000.000.000-00"
                    />
                </div>

                {/* Optional Email domain lock for UX or let it be free text, but we enforce @ebserh.gov.br visually */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail Institucional</label>
                    <input
                        type="email"
                        required
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-accent/50 focus:bg-slate-900 transition-colors text-slate-300 placeholder:text-slate-600"
                        placeholder="usuario@ebserh.gov.br"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil</label>
                        <select
                            value={formData.role || 'Operador'}
                            onChange={(e) => handleChange('role', e.target.value)}
                            className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-accent/50 focus:bg-slate-900 transition-colors text-white"
                        >
                            <option value="Operador">Operador</option>
                            <option value="Supervisor">Supervisor</option>
                            {!isSupervisor && <option value="Admin">Admin</option>}
                        </select>
                    </div>

                    {!initialData && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha de Acesso</label>
                            <input
                                type="password"
                                required={!initialData}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-accent/50 focus:bg-slate-900 transition-colors text-white"
                                placeholder="••••••••"
                            />
                        </div>
                    )}
                </div>

                {!initialData && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmar Senha</label>
                        <input
                            type="password"
                            required={!initialData}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-accent/50 focus:bg-slate-900 transition-colors text-white"
                            placeholder="Repita a senha"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
                >
                    {initialData ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
            </div>
        </form>
    );
};

export default UserForm;
