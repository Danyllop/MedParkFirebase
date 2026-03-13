import React, { useState, useEffect } from 'react';
import { User, CreditCard, Car, Briefcase, MapPin, Phone, Calendar, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { maskCPF, maskPhone, maskPlate } from '../../lib/masks';
import { validateCPF, validatePhone, validatePlate } from '../../lib/validation';
import { useAuth } from '../../store/AuthContext';

interface EmployeeFormProps {
    onCancel?: () => void;
    initialData?: any;
    onSubmit?: (data: any) => void;
}

const bonds = ["EBSERH", "FAGEP", "UFG", "RESIDENTE", "INTERNO"].sort();

const EmployeeForm = ({ onCancel, initialData, onSubmit }: EmployeeFormProps) => {
    const { user: currentUser } = useAuth();
    const isOperator = currentUser?.role === 'OPERADOR';

    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        role: '',
        location: '',
        bond: 'EBSERH',
        phone: '',
        plate: '',
        model: '',
        color: '',
        registrationType: isOperator ? 'PROVISÓRIO' : 'PERMANENTE',
        expirationDate: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                cpf: initialData.cpf || '',
                role: initialData.role || '',
                location: initialData.location || '',
                bond: initialData.bond || 'EBSERH',
                phone: initialData.phone || '',
                plate: initialData.plate || '',
                model: initialData.model || '',
                color: initialData.color || '',
                registrationType: initialData.registrationType || (isOperator ? 'PROVISÓRIO' : 'PERMANENTE'),
                expirationDate: initialData.expirationDate || '',
            });
        } else if (isOperator) {
            // New record for Operator
            const date = new Date();
            date.setDate(date.getDate() + 30);
            setFormData(prev => ({
                ...prev,
                registrationType: 'PROVISÓRIO',
                expirationDate: date.toISOString().split('T')[0]
            }));
        }
    }, [initialData, isOperator]);


    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!validateCPF(formData.cpf)) {
            newErrors.cpf = 'CPF inválido';
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Telefone incompleto';
        }

        if (!validatePlate(formData.plate)) {
            newErrors.plate = 'Placa inválida (formatos: ABC-1234 ou ABC1D23)';
        }

        if (!formData.name) newErrors.name = 'Nome é obrigatório';
        if (!formData.role) newErrors.role = 'Cargo é obrigatório';
        if (!formData.location) newErrors.location = 'Lotação é obrigatória';
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
            } else {
                alert('Funcionário salvo com sucesso!');
            }
        }
    };

    const handleInputChange = (field: string, value: string) => {
        let finalValue = value;

        // Convert key text fields to UPPERCASE
        const uppercaseFields = ['name', 'role', 'location', 'plate', 'model', 'color'];
        if (uppercaseFields.includes(field)) {
            finalValue = value.toUpperCase();
        }

        if (field === 'cpf') finalValue = maskCPF(value);
        if (field === 'phone') finalValue = maskPhone(value);

        if (field === 'registrationType' && value === 'PROVISÓRIO') {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            setFormData(prev => ({
                ...prev,
                [field]: finalValue,
                expirationDate: date.toISOString().split('T')[0]
            }));
        } else if (field === 'registrationType' && value === 'PERMANENTE') {
            setFormData(prev => ({
                ...prev,
                [field]: finalValue,
                expirationDate: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: finalValue }));
        }

        // Clear error when user changes field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent/10 text-accent rounded-button">
                    <User size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{initialData ? 'Editar Funcionário' : 'Informações do Colaborador'}</h2>
                    <p className="text-text-secondary text-xs">Preencha os dados cadastrais e do veículo.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input
                                type="text"
                                required
                                className={cn("input-field w-full pl-10", errors.name && "border-status-error")}
                                placeholder="Nome do colaborador"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                        </div>
                        {errors.name && <p className="text-status-error text-[10px] mt-1">{errors.name}</p>}
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-text-secondary mb-2">CPF</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input
                                type="text"
                                required
                                readOnly={!!initialData}
                                className={cn(
                                    "input-field w-full pl-10",
                                    errors.cpf && "border-status-error",
                                    !!initialData && "bg-white/[0.02] cursor-not-allowed opacity-70"
                                )}
                                placeholder="000.000.000-00"
                                value={formData.cpf}
                                onChange={(e) => handleInputChange('cpf', e.target.value)}
                            />
                        </div>
                        {errors.cpf && <p className="text-status-error text-[10px] mt-1">{errors.cpf}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Tipo de Cadastro</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <select
                                className={cn("input-field w-full pl-10", isOperator && "opacity-70 cursor-not-allowed")}
                                disabled={isOperator}
                                value={formData.registrationType}
                                onChange={(e) => handleInputChange('registrationType', e.target.value)}
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
                                    formData.registrationType !== 'PROVISÓRIO' && "opacity-50 grayscale pointer-events-none"
                                )}
                                value={formData.expirationDate}
                                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input
                                type="text"
                                required
                                className={cn("input-field w-full pl-10", errors.phone && "border-status-error")}
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                            />
                        </div>
                        {errors.phone && <p className="text-status-error text-[10px] mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Cargo</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input
                                type="text"
                                required
                                className={cn("input-field w-full pl-10", errors.role && "border-status-error")}
                                placeholder="Ex: Encarregado"
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                            />
                        </div>
                        {errors.role && <p className="text-status-error text-[10px] mt-1">{errors.role}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Lotação</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input
                                type="text"
                                required
                                className={cn("input-field w-full pl-10", errors.location && "border-status-error")}
                                placeholder="Ex: Internação"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                        </div>
                        {errors.location && <p className="text-status-error text-[10px] mt-1">{errors.location}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Vínculo</label>
                        <select
                            className="input-field w-full"
                            value={formData.bond}
                            onChange={(e) => handleInputChange('bond', e.target.value)}
                        >
                            {bonds.map(bond => (
                                <option key={bond} value={bond}>{bond}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Placa do Veículo</label>
                        <div className="relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input
                                type="text"
                                required
                                maxLength={7}
                                className={cn("input-field w-full pl-10 upper", errors.plate && "border-status-error")}
                                placeholder="ABC-1234 ou ABC1D23"
                                value={formData.plate}
                                onChange={(e) => handleInputChange('plate', maskPlate(e.target.value))}
                            />
                        </div>
                        {errors.plate && <p className="text-status-error text-[10px] mt-1">{errors.plate}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Modelo do Veículo</label>
                        <input
                            type="text"
                            required
                            className={cn("input-field w-full", errors.model && "border-status-error")}
                            placeholder="Ex: COROLLA"
                            value={formData.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                        />
                        {errors.model && <p className="text-status-error text-[10px] mt-1">{errors.model}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Cor do Veículo</label>
                        <input
                            type="text"
                            required
                            className={cn("input-field w-full", errors.color && "border-status-error")}
                            placeholder="Ex: PRATA"
                            value={formData.color}
                            onChange={(e) => handleInputChange('color', e.target.value)}
                        />
                        {errors.color && <p className="text-status-error text-[10px] mt-1">{errors.color}</p>}
                    </div>

                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="btn-primary px-8">
                        {initialData ? 'Atualizar Funcionário' : 'Registrar Funcionário'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
