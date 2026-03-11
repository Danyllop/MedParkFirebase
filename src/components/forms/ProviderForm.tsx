import { useState } from 'react';
import { Truck, User, CreditCard, Building2, Plus, Trash2, ShieldCheck, Calendar } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { cn } from '../../lib/utils';

const ProviderForm = () => {
    const { user: currentUser } = useAuth();
    const isOperator = currentUser?.role === 'OPERADOR';

    const [vehicles, setVehicles] = useState([{ plate: '', model: '' }]);
    const [registrationType, setRegistrationType] = useState(isOperator ? 'PROVISÓRIO' : 'PERMANENTE');
    
    // Set 30 days default
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const [expirationDate, setExpirationDate] = useState(isOperator ? date.toISOString().split('T')[0] : '');

    const addVehicle = () => setVehicles([...vehicles, { plate: '', model: '' }]);
    const removeVehicle = (index: number) => setVehicles(vehicles.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Prestador cadastrado com sucesso! (Regras flexíveis aplicadas)');
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-button">
                    <Truck size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Cadastro de Prestador</h2>
                    <p className="text-text-secondary text-sm">Registro flexível para empresas e múltiplos veículos.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">Dados da Empresa</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Nome da Empresa</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input type="text" required className="input-field w-full pl-10" placeholder="Ex: Clean Solutions LTDA" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">CNPJ / CPF</label>
                        <input type="text" required className="input-field w-full" placeholder="00.000.000/0001-00" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Tipo de Cadastro</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <select
                                className={cn("input-field w-full pl-10", isOperator && "opacity-70 cursor-not-allowed")}
                                disabled={isOperator}
                                value={registrationType}
                                onChange={(e) => setRegistrationType(e.target.value)}
                            >
                                <option value="PERMANENTE">PERMANENTE</option>
                                <option value="PROVISÓRIO">PROVISÓRIO</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Data de Validade (Provisório)</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={18} />
                            <input
                                type="date"
                                className={cn(
                                    "input-field w-full pl-10 [color-scheme:dark]",
                                    registrationType !== 'PROVISÓRIO' && "opacity-50 grayscale pointer-events-none"
                                )}
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">Dados do Responsável/Condutor</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input type="text" required className="input-field w-full pl-10" placeholder="Nome do prestador" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">CPF (Não único)</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input type="text" required className="input-field w-full pl-10" placeholder="000.000.000-00" />
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-accent">Veículos Autorizados</h3>
                        <button
                            type="button"
                            onClick={addVehicle}
                            className="text-xs flex items-center gap-1 text-accent hover:underline"
                        >
                            <Plus size={14} /> Adicionar Veículo
                        </button>
                    </div>

                    {vehicles.map((_, index) => (
                        <div key={index} className="md:col-span-2 grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-white/5 p-4 rounded-card border border-white/5">
                            <div className="md:col-span-3">
                                <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Placa</label>
                                <input type="text" className="input-field w-full text-sm uppercase" placeholder="ABC-1234" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Modelo/Cor</label>
                                <input type="text" className="input-field w-full text-sm" placeholder="Van Branca" />
                            </div>
                            <div className="md:col-span-1 flex justify-center">
                                {vehicles.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVehicle(index)}
                                        className="p-2 text-status-error hover:bg-status-error/10 rounded-button"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 px-2">
                    <button type="button" className="px-6 py-2 text-text-secondary hover:text-text-primary transition-colors">
                        Limpar
                    </button>
                    <button type="submit" className="btn-primary px-8">
                        Confirmar Registro
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProviderForm;
