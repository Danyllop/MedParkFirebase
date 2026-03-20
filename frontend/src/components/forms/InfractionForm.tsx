import React, { useState } from 'react';
import { Search, X, MapPin, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InfractionFormProps {
    onCancel: () => void;
    onSubmit: (data: any) => void;
}

import { vehicleService } from '../../services/firebase/vehicle.service';
import { contractorService } from '../../services/firebase/contractor.service';

const GATE_LOCATIONS: Record<string, string[]> = {
    'A': ['Externa', 'Subsolo 1', 'Subsolo 2'],
    'E': ['Área 1', 'Área 2', 'Área 3', 'Área 4', 'Área 5', 'Doca de Carga e Descarga']
};

const INFRACTION_TYPES = [
    'Vaga Reservada (Deficiente)',
    'Vaga Reservada (Diretoria)',
    'Vaga Reservada (Idoso)',
    'Estacionamento Irregular',
    'Excesso de Velocidade',
    'Obstrução de Via',
    'Desrespeito às Normas',
    'Outros'
];

const InfractionForm: React.FC<InfractionFormProps> = ({ onCancel, onSubmit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        gate: '', // 'A' | 'E'
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        type: '',
        location: '',
        severity: 'MÉDIA' as 'LEVE' | 'MÉDIA' | 'GRAVE',
        description: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length >= 3) {
            setIsSearching(true);
            try {
                // Search in Employee Vehicles
                const empVehicles = await vehicleService.getAll({ search: term });
                
                // Search in Contractor Vehicles
                const contVehiclesRaw = await contractorService.getAllVehicles();
                const contVehiclesFiltered = contVehiclesRaw.filter(v => 
                    v.plate.toUpperCase().includes(term.toUpperCase()) ||
                    v.model.toUpperCase().includes(term.toUpperCase())
                );

                // Fetch extra info for contractors if needed
                const results: any[] = [
                    ...empVehicles.map(v => ({
                        id: v.id,
                        plate: v.plate,
                        owner: v.employee?.name || 'Staff',
                        role: 'FUNCIONÁRIO',
                        model: v.model,
                        color: v.color,
                        type: 'FUNCIONÁRIO'
                    })),
                    ...contVehiclesFiltered.map(v => ({
                        id: v.id,
                        plate: v.plate,
                        owner: 'Prestador', // We'll try to fetch the contractor name below if possible
                        contractorId: v.contractorId,
                        role: 'PRESTADOR',
                        model: v.model,
                        color: v.color,
                        type: 'PRESTADOR'
                    }))
                ];

                // For providers, fetch their names if results are few
                if (results.some(r => r.type === 'PRESTADOR') && results.length < 10) {
                    const contractors = await contractorService.getAll();
                    results.forEach(r => {
                        if (r.type === 'PRESTADOR') {
                            const cont = contractors.find(c => c.id === r.contractorId);
                            if (cont) {
                                r.owner = cont.name;
                                r.role = cont.role || 'PRESTADOR';
                            }
                        }
                    });
                }

                setSearchResults(results);
            } catch (error) {
                console.error('Error searching vehicles:', error);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const selectVehicle = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        if (!selectedVehicle) newErrors.vehicle = 'Selecione um veículo/infrator';
        if (!formData.gate) newErrors.gate = 'Selecione a portaria';
        if (!formData.date) newErrors.date = 'Selecione a data';
        if (!formData.time) newErrors.time = 'Selecione a hora';
        if (!formData.type) newErrors.type = 'Selecione o tipo de infração';
        if (!formData.location) newErrors.location = 'Selecione a localização';
        if (!formData.description.trim()) newErrors.description = 'A descrição é obrigatória';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            ...formData,
            vehicle: selectedVehicle,
            // Date is handled by the service typically, but we pass what the UI expects
            plate: selectedVehicle.plate,
            name: selectedVehicle.owner,
            role: selectedVehicle.role
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex-1 pt-2 space-y-3 pb-2">
                
                {/* 1. Vehicle Selection (Search) */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                        <CarIcon /> Veículo ou Infrator
                    </label>
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar placa, adesivo ou nome..."
                                className={cn("input-field w-full pl-10", errors.vehicle && "border-status-error")}
                                value={selectedVehicle ? `${selectedVehicle.plate} - ${selectedVehicle.owner}` : searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={!!selectedVehicle}
                            />
                            {selectedVehicle && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedVehicle(null)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            {isSearching && (
                                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                                </div>
                            )}
                        </div>
                        {errors.vehicle && <p className="text-status-error text-[10px] mt-1">{errors.vehicle}</p>}

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && !selectedVehicle && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                                {searchResults.map((v, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => selectVehicle(v)}
                                        className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="text-white font-bold text-sm tracking-wide">{v.plate}</p>
                                            <p className="text-slate-400 text-[10px]">{v.owner} • {v.model}</p>
                                        </div>
                                        <span className="text-[9px] font-bold text-accent uppercase bg-accent/10 px-2 py-0.5 rounded">
                                            {v.type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Auto-filled Details */}
                    {selectedVehicle && (
                        <div className="bg-background-dark/50 border border-white/5 p-3 rounded-lg grid grid-cols-3 gap-3 text-xs w-full">
                            <div className="min-w-0">
                                <span className="text-slate-500 block mb-0.5 text-[9px] uppercase font-bold">Infrator</span>
                                <span className="text-white font-medium block truncate" title={selectedVehicle.owner}>{selectedVehicle.owner}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="text-slate-500 block mb-0.5 text-[9px] uppercase font-bold">Vínculo</span>
                                <span className="text-slate-300 block truncate" title={selectedVehicle.role}>{selectedVehicle.role}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="text-slate-500 block mb-0.5 text-[9px] uppercase font-bold">Veículo</span>
                                <span className="text-slate-300 block truncate" title={`${selectedVehicle.model} - ${selectedVehicle.color}`}>{selectedVehicle.model} - {selectedVehicle.color}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Date and Time Fields */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Data da Ocorrência</label>
                        <input
                            type="date"
                            className={cn("input-field w-full", errors.date && "border-status-error")}
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            style={{ colorScheme: 'dark' }}
                        />
                        {errors.date && <p className="text-status-error text-[10px] mt-1">{errors.date}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Hora</label>
                        <input
                            type="time"
                            className={cn("input-field w-full", errors.time && "border-status-error")}
                            value={formData.time}
                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                            style={{ colorScheme: 'dark' }}
                        />
                        {errors.time && <p className="text-status-error text-[10px] mt-1">{errors.time}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Gate Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Portaria</label>
                        <select
                            className={cn("input-field w-full", errors.gate && "border-status-error")}
                            value={formData.gate}
                            onChange={e => {
                                setFormData({ ...formData, gate: e.target.value, location: '' });
                            }}
                        >
                            <option value="">Selecione...</option>
                            <option value="A">Portaria A</option>
                            <option value="E">Portaria E</option>
                        </select>
                        {errors.gate && <p className="text-status-error text-[10px] mt-1">{errors.gate}</p>}
                    </div>

                    {/* Location (Dynamic) */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" /> Local
                        </label>
                        <select
                            className={cn("input-field w-full", errors.location && "border-status-error")}
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            disabled={!formData.gate}
                        >
                            <option value="">Selecione o local...</option>
                            {formData.gate && GATE_LOCATIONS[formData.gate]?.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                        {errors.location && <p className="text-status-error text-[10px] mt-1">{errors.location}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Infraction Type */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-slate-400" /> Tipo de Infração
                        </label>
                        <select
                            className={cn("input-field w-full", errors.type && "border-status-error")}
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {INFRACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.type && <p className="text-status-error text-[10px] mt-1">{errors.type}</p>}
                    </div>
                </div>

                {/* 4. Severity */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">Gravidade da Infração</label>
                    <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5">
                        {['LEVE', 'MÉDIA', 'GRAVE'].map(level => {
                            const isSelected = formData.severity === level;
                            return (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, severity: level as any })}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                                        isSelected 
                                            ? level === 'GRAVE' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                                            : level === 'MÉDIA' ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20"
                                            : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Description */}
                <div className="space-y-2 pb-0">
                    <label className="text-xs font-semibold text-slate-300 block">
                        Descrição da Infração <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        className={cn("input-field w-full min-h-[100px] resize-none", errors.description && "border-status-error")}
                        placeholder="Descreva detalhes importantes da ocorrência..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                    />
                    {errors.description && <p className="text-status-error text-[10px] mt-1">{errors.description}</p>}
                </div>

            </div>

            {/* Form Actions */}
            <div className="pt-4 flex justify-end gap-3 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                    Cancelar
                </button>
                <button type="submit" className="btn-primary px-8 text-xs flex items-center gap-2">
                    Registrar Infração
                </button>
            </div>
        </form>
    );
};

const CarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
);

export default InfractionForm;
