import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Star, User, CreditCard, Hash, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { maskPlate } from '../../lib/masks';
import { validatePlate } from '../../lib/validation';

interface VehicleFormProps {
    onCancel?: () => void;
    initialData?: any;
    onSubmit?: (data: any) => void;
    employees?: { id: number | string; name: string; cpf: string }[];
}

const VehicleForm = ({ onCancel, initialData, onSubmit, employees = [] }: VehicleFormProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        ownerId: '',
        owner: '',
        plate: '',
        model: '',
        color: '',
        notes: '',
        isPrincipal: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                ownerId: initialData.ownerId || '',
                owner: initialData.owner || '',
                plate: initialData.plate || '',
                model: initialData.model || '',
                color: initialData.color || '',
                notes: initialData.notes || '',
                isPrincipal: initialData.isPrincipal || false,
            });
        }
    }, [initialData]);

    // Handle clicks outside search results to close them
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredEmployees = useMemo(() => {
        const query = searchQuery.toUpperCase().trim();
        if (!query || query.length < 2) return [];

        const numericQuery = query.replace(/\D/g, '');

        return employees.filter(emp => {
            const nameMatch = emp.name.toUpperCase().includes(query);
            const cpfMatch = numericQuery !== '' && emp.cpf.replace(/\D/g, '').includes(numericQuery);
            return nameMatch || cpfMatch;
        }).slice(0, 5); // Limit to top 5 results for clarity
    }, [searchQuery, employees]);

    const selectedEmployee = useMemo(() => {
        if (!formData.ownerId) return null;
        return employees.find(e => e.id.toString() === formData.ownerId);
    }, [formData.ownerId, employees]);

    const handleSelectEmployee = (emp: any) => {
        setFormData(prev => ({
            ...prev,
            ownerId: emp.id.toString(),
            owner: emp.name
        }));
        if (errors.owner) setErrors(prev => ({ ...prev, owner: '' }));
        setSearchQuery('');
        setShowResults(false);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.ownerId) newErrors.owner = 'Pesquise e selecione o proprietário';
        if (!validatePlate(formData.plate)) newErrors.plate = 'Placa inválida';
        if (!formData.model) newErrors.model = 'Modelo é obrigatório';
        if (!formData.color) newErrors.color = 'Cor é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            if (onSubmit) {
                onSubmit(formData);
            }
        }
    };

    const handleInputChange = (field: string, value: any) => {
        let finalValue = value;
        const uppercaseFields = ['plate', 'model', 'color'];
        if (uppercaseFields.includes(field) && typeof value === 'string') {
            finalValue = value.toUpperCase();
        }
        setFormData(prev => ({ ...prev, [field]: finalValue }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!initialData ? (
                /* Novo Registro - Pesquisa Autocomplete */
                <div className="space-y-4">
                    <div className="space-y-2" ref={searchRef}>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">
                            Pesquisar Proprietário (Nome ou CPF)
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input
                                type="text"
                                placeholder="DIGITE PARA BUSCAR..."
                                className={cn(
                                    "input-field w-full pl-10 h-11 transition-all",
                                    errors.owner && "border-status-error",
                                    showResults && "rounded-b-none border-accent/40"
                                )}
                                value={searchQuery}
                                onFocus={() => setShowResults(true)}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value.toUpperCase());
                                    setShowResults(true);
                                }}
                            />

                            {/* Autocomplete Dropdown */}
                            {showResults && searchQuery.length >= 2 && (
                                <div className="absolute top-full left-0 right-0 bg-slate-900 border-x border-b border-accent/40 rounded-b-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                    {filteredEmployees.length > 0 ? (
                                        <div className="divide-y divide-white/5">
                                            {filteredEmployees.map(emp => (
                                                <button
                                                    key={emp.id}
                                                    type="button"
                                                    onClick={() => handleSelectEmployee(emp)}
                                                    className="w-full px-4 py-3 text-left hover:bg-white/[0.05] flex items-center justify-between group transition-colors"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">{emp.name}</span>
                                                        <span className="text-[10px] text-text-secondary font-mono">CPF: {emp.cpf}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-secondary group-hover:border-accent/30 group-hover:text-accent transition-all">ID: {emp.id}</span>
                                                        <User size={14} className="text-text-secondary group-hover:text-accent opacity-50" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-6 text-center text-text-secondary italic text-xs">
                                            Nenhum proprietário encontrado com "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {errors.owner && <p className="text-status-error text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.owner}</p>}
                    </div>

                    {/* Selected Owner Info Card (Read Only) */}
                    {selectedEmployee && (
                        <div className="glass-card bg-accent/5 border border-accent/20 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 text-accent">
                                    <User size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Proprietário Selecionado</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, ownerId: '', owner: '' }))}
                                    className="p-1 hover:bg-status-error/10 text-text-secondary hover:text-status-error rounded-md transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Nome</span>
                                    <span className="text-sm font-bold text-text-primary truncate">{selectedEmployee.name}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">ID Registro</span>
                                    <span className="text-sm font-mono font-bold text-text-primary">{selectedEmployee.id}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">CPF</span>
                                    <span className="text-sm font-mono font-bold text-text-primary">{selectedEmployee.cpf}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Edição - Card Simplificado */
                <div className="glass-card bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                        <User size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Proprietário (Somente Leitura)</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-text-primary uppercase tracking-tight">{formData.owner}</span>
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            <span className="text-[10px] font-mono text-text-secondary">ID: {formData.ownerId}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehicle Details Section */}
            <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="text-accent/60" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Detalhes do Veículo</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest">
                            Placa do Veículo
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                            <input
                                type="text"
                                placeholder="ABC1D23"
                                maxLength={7}
                                className={cn("input-field w-full pl-9 h-11 font-mono font-bold text-accent", errors.plate && "border-status-error")}
                                value={formData.plate}
                                onChange={(e) => handleInputChange('plate', maskPlate(e.target.value))}
                            />
                        </div>
                        {errors.plate && <p className="text-status-error text-[10px] font-bold mt-1">{errors.plate}</p>}
                    </div>


                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest">
                            Modelo *
                        </label>
                        <input
                            type="text"
                            placeholder="EX: TOYOTA COROLLA"
                            className={cn("input-field w-full h-11 uppercase font-semibold", errors.model && "border-status-error")}
                            value={formData.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                        />
                        {errors.model && <p className="text-status-error text-[10px] font-bold mt-1">{errors.model}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest">
                            Cor *
                        </label>
                        <input
                            type="text"
                            placeholder="EX: PRATA"
                            className={cn("input-field w-full h-11 uppercase font-semibold", errors.color && "border-status-error")}
                            value={formData.color}
                            onChange={(e) => handleInputChange('color', e.target.value)}
                        />
                        {errors.color && <p className="text-status-error text-[10px] font-bold mt-1">{errors.color}</p>}
                    </div>
                </div>

                {/* Observações */}
                <div className="mt-4 space-y-2">
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                        Observações <span className="opacity-40 italic font-normal normal-case">(Opcional)</span>
                    </label>
                    <div className="relative group">
                        <Info className="absolute left-3 top-3 text-text-secondary group-focus-within:text-accent transition-colors" size={16} />
                        <textarea
                            rows={3}
                            className="input-field w-full resize-none pl-10 pt-3 text-sm focus:border-accent/40"
                            placeholder="EX: CARRO DA ESPOSA(A), VEÍCULO RESERVA, ETC..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                        />
                    </div>
                </div>

                {/* Principal Toggle */}
                <div className="mt-4 flex items-center gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
                                checked={formData.isPrincipal}
                                onChange={(e) => handleInputChange('isPrincipal', e.target.checked)}
                            />
                            <div className={cn(
                                "h-5 w-5 rounded-md border transition-all duration-200 flex items-center justify-center",
                                formData.isPrincipal
                                    ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                                    : "border-white/20 bg-white/5 group-hover:border-white/40"
                            )}>
                                {formData.isPrincipal && <Star size={12} className="fill-current" />}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={14} className={cn(formData.isPrincipal ? "text-status-warning fill-status-warning animate-pulse" : "text-text-secondary")} />
                            <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors tracking-tight uppercase">
                                Definir como Veículo Principal
                            </span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Buttons grouped at bottom */}
            <div className="pt-6 border-t border-white/5 flex justify-end gap-3 translate-y-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 text-xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-widest transition-colors"
                >
                    Cancelar
                </button>
                <button type="submit" className="btn-primary px-8 py-2.5 text-xs font-black uppercase tracking-widest shadow-xl shadow-accent/20">
                    {initialData ? 'Atualizar Veículo' : 'Registrar Veículo'}
                </button>
            </div>
        </form>
    );
};

export default VehicleForm;
