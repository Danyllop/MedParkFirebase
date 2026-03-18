import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Map, 
    List, 
    X, 
    Car, 
    User, 
    CheckCircle2, 
    Bookmark, 
    Ban, 
    Info, 
    LogIn,
    Package,
    Edit,
    Trash2,
    RotateCcw,
    ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { mockEmployees, mockVehicles } from '../data/mockData';
import Modal from '../components/ui/Modal';

interface Vacancy {
    id: number;
    number: string;
    type: 'DIRETORIA' | 'COMUM' | 'PNE' | 'IDOSO' | 'ALMOXARIFADO' | 'CEROF';
    status: 'DISPONIVEL' | 'OCUPADA' | 'RESERVADA' | 'MANUTENCAO';
    owner?: string;
    vehicle?: string;
    plate?: string;
    destination?: string;
}

const PortariaE = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const isSupervisor = user?.role === 'SUPERVISOR';
    const canManageSpots = isAdmin || isSupervisor;

    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDestination, setFilterDestination] = useState('');
    const [typeFilter] = useState<'TODOS' | Vacancy['type']>('TODOS');

    // Manual Entry State
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [manualSearchTerm, setManualSearchTerm] = useState('');
    const [selectedEmployeeForEntry, setSelectedEmployeeForEntry] = useState<any>(null);
    const [manualEntryStep, setManualEntryStep] = useState<'search' | 'confirm'>('search');
    const [entrySpotSearch, setEntrySpotSearch] = useState('');

    // Load from local storage or generate 200 spots
    useEffect(() => {
        const saved = localStorage.getItem('gate_e_vacancies');
        if (saved) {
            setVacancies(JSON.parse(saved));
        } else {
            const initialVacancies: Vacancy[] = Array.from({ length: 200 }, (_, i) => {
                let status: Vacancy['status'] = 'DISPONIVEL';
                let owner, vehicle, plate, destination;

                if (i === 10) {
                    status = 'OCUPADA';
                    owner = 'SILVA TRANSPORTES';
                    vehicle = 'VOLKSWAGEN DELIVERY';
                    plate = 'GHI-5678';
                    destination = 'ALMOXARIFADO';
                } else if (i === 25) {
                    status = 'RESERVADA';
                    destination = 'MANUTENÇÃO';
                }

                return {
                    id: i + 1,
                    number: `E-${(i + 1).toString().padStart(3, '0')}`,
                    type: 'COMUM',
                    status,
                    owner,
                    vehicle,
                    plate,
                    destination
                };
            });
            setVacancies(initialVacancies);
            localStorage.setItem('gate_e_vacancies', JSON.stringify(initialVacancies));
        }
    }, []);

    const addHistoryEntry = (entry: any) => {
        const savedHistory = JSON.parse(localStorage.getItem('gate_e_history') || '[]');
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString('pt-BR').slice(0, 16).replace(',', ''),
            operator: user?.name?.toUpperCase() || 'ADMIN',
            ...entry
        };
        const updatedHistory = [newEntry, ...savedHistory].slice(0, 150);
        localStorage.setItem('gate_e_history', JSON.stringify(updatedHistory));
    };

    const stats = useMemo(() => ({
        total: vacancies.length,
        disponiveis: vacancies.filter(v => v.status === 'DISPONIVEL').length,
        reservadas: vacancies.filter(v => v.status === 'RESERVADA').length,
        ocupadas: vacancies.filter(v => v.status === 'OCUPADA').length
    }), [vacancies]);

    const filteredVacancies = vacancies.filter(v => {
        const matchesSearch = v.number.includes(searchTerm.toUpperCase()) ||
                            v.owner?.includes(searchTerm.toUpperCase()) ||
                            v.plate?.includes(searchTerm.toUpperCase());
        const matchesDestination = filterDestination === '' || v.destination === filterDestination;
        const matchesType = typeFilter === 'TODOS' || v.type === typeFilter;
        return matchesSearch && matchesDestination && matchesType;
    });

    const handleReleaseSpot = (spot: Vacancy) => {
        const updatedVacancies = vacancies.map(v => 
            v.id === spot.id 
                ? { ...v, status: 'DISPONIVEL' as const, owner: undefined, vehicle: undefined, plate: undefined, destination: undefined }
                : v
        );
        setVacancies(updatedVacancies);
        localStorage.setItem('gate_e_vacancies', JSON.stringify(updatedVacancies));
        
        addHistoryEntry({
            spot: spot.number,
            event: 'SAÍDA',
            owner: spot.owner,
            plate: spot.plate
        });

        setSelectedVacancy(null);
        alert(`Vaga ${spot.number} liberada com sucesso!`);
    };

    const handleReserveSpot = (spot: Vacancy) => {
        if (spot.status === 'RESERVADA') {
            if (!confirm(`Deseja retirar a reserva da vaga ${spot.number} para ${spot.owner}?`)) return;
            const updatedVacancies = vacancies.map(v => 
                v.id === spot.id ? { ...v, status: 'DISPONIVEL' as const, owner: undefined } : v
            );
            setVacancies(updatedVacancies);
            localStorage.setItem('gate_e_vacancies', JSON.stringify(updatedVacancies));
            
            addHistoryEntry({
                spot: spot.number,
                event: 'LIBERAÇÃO',
                owner: spot.owner
            });

            alert(`Reserva da vaga ${spot.number} retirada com sucesso!`);
            setSelectedVacancy(null);
            return;
        }

        if (spot.status !== 'DISPONIVEL') return;
        const owner = prompt("Motivo da reserva:");
        if (owner) {
            const updatedVacancies = vacancies.map(v => 
                v.id === spot.id ? { ...v, status: 'RESERVADA' as const, owner } : v
            );
            setVacancies(updatedVacancies);
            localStorage.setItem('gate_e_vacancies', JSON.stringify(updatedVacancies));
            
            addHistoryEntry({
                spot: spot.number,
                event: 'RESERVA',
                owner
            });

            alert(`Vaga ${spot.number} reservada para ${owner}`);
            setSelectedVacancy(null);
        }
    };

    const handleDeleteSpot = (spot: Vacancy) => {
        if (!isAdmin) return;
        if (confirm(`Tem certeza que deseja excluir a vaga ${spot.number}?`)) {
            const updatedVacancies = vacancies.filter(v => v.id !== spot.id);
            setVacancies(updatedVacancies);
            localStorage.setItem('gate_e_vacancies', JSON.stringify(updatedVacancies));
            if (selectedVacancy?.id === spot.id) setSelectedVacancy(null);
            alert(`Vaga ${spot.number} excluída.`);
        }
    };

    const getSpotStyle = (vacancy: Vacancy) => {
        switch (vacancy.status) {
            case 'DISPONIVEL': return "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/10";
            case 'OCUPADA': return "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:border-rose-500/40";
            case 'RESERVADA': return "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:border-amber-500/40";
            case 'MANUTENCAO': return "bg-slate-800 border-slate-700 text-slate-500 opacity-50";
            default: return "bg-slate-800/50 border-white/5 text-slate-400";
        }
    };

    const getStatusIcon = (status: Vacancy['status']) => {
        switch (status) {
            case 'DISPONIVEL': return <CheckCircle2 size={20} className="opacity-40" />;
            case 'OCUPADA': return <Car size={20} className="fill-current" />;
            case 'RESERVADA': return <Bookmark size={20} className="fill-current" />;
            case 'MANUTENCAO': return <Ban size={20} />;
            default: return null;
        }
    };

    const handleResetMap = () => {
        const hasActiveSpots = vacancies.some(v => v.status === 'OCUPADA' || v.status === 'RESERVADA');
        if (hasActiveSpots) {
            alert('Não é possível reiniciar o mapa! Existem vagas ocupadas ou reservadas no momento. Libere todas as vagas antes de reiniciar.');
            return;
        }

        if (!confirm('Tem certeza que deseja reiniciar o mapa? Todas as vagas voltarão ao status DISPONIVEL.')) return;
        setVacancies(prev => prev.map(v => ({ ...v, status: 'DISPONIVEL' as const, owner: undefined, vehicle: undefined, plate: undefined, destination: undefined })));
        setSelectedVacancy(null);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-dark overflow-hidden relative">
            <div className={cn(
                "p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar transition-all duration-300",
                selectedVacancy ? "lg:mr-[340px]" : ""
            )}>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                <Map size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                Portaria <span className="text-accent">E</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">MONITORAMENTO DE ACESSO E LOGÍSTICA</p>
                    </div>
                </div>

                {/* Search row */}
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative w-full lg:max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                        <input 
                            className="input-field w-full h-12 pl-12 pr-4 bg-slate-900/50 border-white/5 rounded-xl focus:border-accent/40 transition-all font-medium placeholder:text-slate-600 uppercase"
                            placeholder="PESQUISAR POR NOME, CPF OU PLACA..." 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        />
                    </div>
                    
                    <div className="relative min-w-[200px]">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <select
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-accent/40 transition-all text-white appearance-none font-bold uppercase tracking-widest cursor-pointer"
                            value={filterDestination}
                            onChange={(e) => setFilterDestination(e.target.value)}
                        >
                            <option value="">Destino: Todos</option>
                            <option value="ALMOXARIFADO">Almoxarifado</option>
                            <option value="MANUTENÇÃO">Manutenção</option>
                            <option value="LIMPEZA">Limpeza</option>
                            <option value="COZINHA">Cozinha</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => setIsManualEntryOpen(true)}
                        className="h-10 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20 flex items-center gap-2 whitespace-nowrap"
                    >
                        <LogIn size={14} /> ENTRADA MANUAL
                    </button>

                    <div className="flex items-center gap-3 ml-auto">
                        <div className="flex h-10 items-center bg-slate-900 border border-white/5 p-1 rounded-xl shadow-inner">
                            <button 
                                onClick={() => setViewMode('map')}
                                className={cn(
                                    "px-4 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    viewMode === 'map' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <Map size={14} /> MAPA
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "px-4 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    viewMode === 'list' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <List size={14} /> LISTA
                            </button>
                        </div>
                    {isAdmin && (
                        <button
                            onClick={handleResetMap}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                        >
                            <RotateCcw size={14} /> Reiniciar Mapa
                        </button>
                    )}
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="flex flex-wrap items-center justify-between gap-6 glass-card bg-slate-900/40 border-white/5 p-4 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-8">
                        <div className="space-y-0.5">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">Total de Vagas</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{stats.total}</span>
                                <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">unidades</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-white/5"></div>
                        <div className="flex gap-10">
                            {[
                                { label: 'Disponíveis', value: stats.disponiveis, color: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
                                { label: 'Reservadas', value: stats.reservadas, color: 'bg-amber-500', ring: 'ring-amber-500/20' },
                                { label: 'Ocupadas', value: stats.ocupadas, color: 'bg-rose-500', ring: 'ring-rose-500/20' }
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-center gap-3">
                                    <div className={cn("size-2.5 rounded-full ring-4", stat.color, stat.ring)}></div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
                                        <p className="text-lg font-black text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content View */}
                {viewMode === 'map' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-4 pb-8">
                        {filteredVacancies.map((vacancy) => {
                            const isSelected = selectedVacancy?.id === vacancy.id;
                            
                            return (
                                <motion.button
                                    key={vacancy.id}
                                    whileHover={{ y: -2 }}
                                    onClick={() => setSelectedVacancy(vacancy)}
                                    className={cn(
                                        "aspect-[2/3] flex flex-col items-center justify-center gap-2 border-2 rounded-xl transition-all relative overflow-hidden group",
                                        getSpotStyle(vacancy),
                                        isSelected && "ring-2 ring-accent ring-offset-4 ring-offset-background-dark border-accent"
                                    )}
                                >
                                    <span className="text-xs font-black uppercase tracking-tighter opacity-80">{vacancy.number}</span>
                                    {getStatusIcon(vacancy.status)}
                                    {vacancy.owner && (
                                        <span className="text-[9px] font-black text-white/90 uppercase tracking-tighter w-full text-center truncate px-1">
                                            {vacancy.owner.split(' ').slice(0, 2).join(' ')}
                                        </span>
                                    )}
                                    {vacancy.plate && (
                                        <p className="text-[10px] font-black bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 truncate max-w-[90%] uppercase tracking-tighter">
                                            {vacancy.plate}
                                        </p>
                                    )}
                                    <span className="mt-auto mb-2 text-[9px] font-black opacity-50 group-hover:opacity-90 transition-opacity uppercase tracking-widest">
                                        {vacancy.type}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-card bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl mb-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vaga</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Local</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    {canManageSpots && (
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredVacancies.map((vacancy) => {
                                    const isSelected = selectedVacancy?.id === vacancy.id;

                                    return (
                                        <tr 
                                            key={vacancy.id}
                                            onClick={() => setSelectedVacancy(vacancy)}
                                            className={cn(
                                                "group hover:bg-white/5 transition-colors cursor-pointer",
                                                isSelected && "bg-accent/10"
                                            )}
                                        >
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400">#{vacancy.id.toString().padStart(3, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("size-2 rounded-full", 
                                                        vacancy.status === 'DISPONIVEL' ? "bg-emerald-500" : 
                                                        vacancy.status === 'OCUPADA' ? "bg-rose-500" : 
                                                        vacancy.status === 'RESERVADA' ? "bg-amber-500" : "bg-slate-500"
                                                    )}></div>
                                                    <span className="text-sm font-black text-white">{vacancy.number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                                    {vacancy.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portaria E</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    vacancy.status === 'DISPONIVEL' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                                    vacancy.status === 'OCUPADA' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                    vacancy.status === 'MANUTENCAO' ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                                                    "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                )}>
                                                    {vacancy.status === 'DISPONIVEL' ? 'DISPONIVEL' : vacancy.status}
                                                </span>
                                            </td>
                                            {canManageSpots && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            disabled={vacancy.status !== 'DISPONIVEL'}
                                                            onClick={(e) => { e.stopPropagation(); /* TODO: Implement Edit */ }}
                                                            className={cn(
                                                                "p-1.5 flex items-center justify-center rounded transition-colors",
                                                                vacancy.status === 'DISPONIVEL' 
                                                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                                                                    : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                                                            )}
                                                            title={vacancy.status === 'DISPONIVEL' ? "Editar Vaga" : "Vaga não pode ser Editada"}
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button 
                                                            disabled={vacancy.status !== 'DISPONIVEL' && vacancy.status !== 'RESERVADA'}
                                                            onClick={(e) => { e.stopPropagation(); handleReserveSpot(vacancy); }}
                                                            className={cn(
                                                                "p-1.5 flex items-center justify-center rounded transition-colors",
                                                                vacancy.status === 'DISPONIVEL'
                                                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-500"
                                                                    : vacancy.status === 'RESERVADA'
                                                                        ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
                                                                        : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                                                            )}
                                                            title={vacancy.status === 'DISPONIVEL' ? "Reservar Vaga" : vacancy.status === 'RESERVADA' ? "Retirar Reserva" : "Vaga não pode ser Reservada"}
                                                        >
                                                            <Bookmark size={14} />
                                                        </button>
                                                        {isAdmin && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteSpot(vacancy); }}
                                                                className="p-1.5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors"
                                                                title="Deletar Vaga"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Right Side Detail Panel */}
            <AnimatePresence>
                {selectedVacancy && (
                    <motion.div 
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="fixed top-24 right-8 bottom-8 w-[300px] bg-slate-900 border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 z-40 flex flex-col"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className={cn(
                                    "inline-block px-2.5 py-1 rounded bg-opacity-10 border text-[9px] font-black uppercase tracking-widest mb-3",
                                    selectedVacancy.status === 'OCUPADA' ? "bg-rose-500 text-rose-500 border-rose-500/20" : 
                                    selectedVacancy.status === 'RESERVADA' ? "bg-amber-500 text-amber-500 border-amber-500/20" :
                                    selectedVacancy.status === 'MANUTENCAO' ? "bg-slate-500 text-slate-500 border-slate-500/20" :
                                    "bg-emerald-500 text-emerald-500 border-emerald-500/20"
                                )}>
                                    Vaga {selectedVacancy.status === 'OCUPADA' ? 'Ocupada' : selectedVacancy.status === 'RESERVADA' ? 'Reservada' : selectedVacancy.status === 'MANUTENCAO' ? 'Em Manutencao' : 'Disponivel'}
                                </span>
                                <h3 className="text-3xl font-black text-white tracking-tighter">{selectedVacancy.number}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    Pátio Almoxarifado / Portaria E
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedVacancy(null)}
                                className="size-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {selectedVacancy.status === 'OCUPADA' ? (
                                <>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-accent/20 transition-all">
                                        <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Motivo da Reserva</p>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{selectedVacancy.owner}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-accent/20 transition-all">
                                        <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                            <Car size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Veículo / Placa</p>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{selectedVacancy.vehicle} • {selectedVacancy.plate}</p>
                                        </div>
                                    </div>

                                    {selectedVacancy.destination && (
                                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Destino</p>
                                                <p className="text-sm font-bold text-white uppercase tracking-tight">{selectedVacancy.destination}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleReleaseSpot(selectedVacancy)}
                                        className="w-full mt-4 py-4 bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
                                    >
                                        Liberar Vaga
                                    </button>
                                </>
                            ) : selectedVacancy.status === 'DISPONIVEL' ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                    <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 size={32} className="opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-300">Vaga Disponivel</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Pronta para nova entrada de serviço.</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setEntrySpotSearch(selectedVacancy.number);
                                            setIsManualEntryOpen(true);
                                            setManualEntryStep('search');
                                        }}
                                        className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all border border-emerald-500/20 flex items-center justify-center gap-3"
                                    >
                                        <LogIn size={16} /> Entrada Manual
                                    </button>
                                </div>
                            ) : selectedVacancy.status === 'RESERVADA' ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                    <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <Bookmark size={32} className="opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-300">Vaga Reservada</p>
                                        <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Esta vaga possui uma reserva ativa para um colaborador específico.</p>
                                    </div>
                                    <button 
                                        onClick={() => handleReserveSpot(selectedVacancy)}
                                        className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all border border-amber-500/20 flex items-center justify-center gap-3"
                                    >
                                        <Bookmark size={16} /> Retirar Reserva
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                    <div className="size-16 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500">
                                        <Ban size={32} className="opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-300">Indisponível</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Esta vaga está em manutenção.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5">
                            <button 
                                onClick={() => navigate(`/reports?vaga=${selectedVacancy.number}`)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Info size={14} /> Ver Histórico da Vaga
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Entry Modal for Portaria E */}
            <Modal
                isOpen={isManualEntryOpen}
                onClose={() => {
                    setIsManualEntryOpen(false);
                    setManualEntryStep('search');
                    setSelectedEmployeeForEntry(null);
                    setManualSearchTerm('');
                    setEntrySpotSearch('');
                }}
                title={manualEntryStep === 'search' ? "REGISTRAR ENTRADA MANUAL (PÁTIO E)" : "CONFIRMAR ENTRADA"}
            >
                <div className="space-y-6 py-2">
                    {manualEntryStep === 'search' ? (
                        <>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                                <input 
                                    className="w-full h-12 pl-12 pr-4 bg-slate-900 border border-white/5 rounded-xl focus:border-accent/40 transition-all font-medium placeholder:text-slate-600 uppercase text-white"
                                    placeholder="BUSCAR POR NOME, CPF, PLACA OU ADESIVO..." 
                                    type="text"
                                    autoFocus
                                    value={manualSearchTerm}
                                    onChange={(e) => setManualSearchTerm(e.target.value.toUpperCase())}
                                />
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                {manualSearchTerm.length >= 2 ? (
                                    mockEmployees
                                        .filter(emp => {
                                            const vehicle = mockVehicles.find(v => v.ownerId === emp.id);
                                            return emp.name.includes(manualSearchTerm) || 
                                                   emp.cpf.includes(manualSearchTerm) ||
                                                   vehicle?.plate.includes(manualSearchTerm);
                                        })
                                        .map(emp => {
                                            const vehicle = mockVehicles.find(v => v.ownerId === emp.id);
                                            return (
                                                <div 
                                                    key={emp.id}
                                                    onClick={() => {
                                                        setSelectedEmployeeForEntry(emp);
                                                        setManualEntryStep('confirm');
                                                    }}
                                                    className="p-4 bg-slate-800/40 border border-white/5 rounded-xl hover:border-accent/30 transition-all group cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                                                                <User size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-white uppercase tracking-tight">{emp.name}</p>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{emp.role} • {emp.bond}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {vehicle && (
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    <Car size={14} className="text-accent" />
                                                                    <span className="text-xs font-black text-white tracking-widest">{vehicle.plate}</span>
                                                                </div>
                                                            )}
                                                            <button className="mt-2 px-3 py-1.5 bg-accent/10 group-hover:bg-accent text-accent group-hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                                                                Selecionar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="py-10 text-center text-slate-600">
                                        <Search size={32} className="mx-auto mb-3 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Digite pelo menos 2 caracteres para pesquisar</p>
                                    </div>
                                )}
                                
                                {manualSearchTerm.length >= 2 && mockEmployees.filter(emp => {
                                    const vehicle = mockVehicles.find(v => v.ownerId === emp.id);
                                    return emp.name.includes(manualSearchTerm) || 
                                           emp.cpf.includes(manualSearchTerm) ||
                                           vehicle?.plate.includes(manualSearchTerm);
                                }).length === 0 && (
                                    <div className="py-10 text-center text-slate-500">
                                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum cadastro encontrado</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {(() => {
                                const vehicle = mockVehicles.find(v => v.ownerId === selectedEmployeeForEntry?.id);
                                const isAlreadyInside = vacancies.find(v => 
                                    v.status === 'OCUPADA' && 
                                    ((v.owner && v.owner === selectedEmployeeForEntry?.name) || 
                                     (v.plate && vehicle && v.plate === vehicle.plate))
                                );

                                const normalizedSearch = entrySpotSearch.toUpperCase().trim();
                                const numberMatchSearch = normalizedSearch.replace(/[^0-9]/g, '');
                                
                                const matchedSpot = entrySpotSearch ? vacancies.find(v => {
                                    if (v.number === normalizedSearch) return true;
                                    if (numberMatchSearch && v.number.endsWith(numberMatchSearch.padStart(3, '0'))) return true;
                                    return false;
                                }) : null;

                                const isSpotOccupied = matchedSpot?.status === 'OCUPADA';
                                const isSpotReservedOrMaintenance = matchedSpot?.status === 'RESERVADA' || matchedSpot?.status === 'MANUTENCAO';
                                const canConfirm = matchedSpot && !isSpotOccupied && !isAlreadyInside && !isSpotReservedOrMaintenance;

                                return (
                                    <>
                                        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="size-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                                    <User size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedEmployeeForEntry?.name}</h3>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedEmployeeForEntry?.role} • {selectedEmployeeForEntry?.bond}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-800/40 rounded-xl border border-white/5">
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">CPF</p>
                                                    <p className="text-sm font-bold text-white tracking-wider">{selectedEmployeeForEntry?.cpf}</p>
                                                </div>
                                                <div className="p-4 bg-slate-800/40 rounded-xl border border-white/5">
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Veículo / Placa</p>
                                                    <div className="flex items-center gap-2">
                                                        <Car size={16} className="text-accent" />
                                                        <p className="text-sm font-black text-white tracking-widest">
                                                            {vehicle?.plate || 'NÃO VINCULADA'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {isAlreadyInside && (
                                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                                                <ShieldAlert className="text-rose-500 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Entrada Bloqueada</p>
                                                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                                                        Este colaborador já possui uma entrada ativa na Vaga {isAlreadyInside.number}. É necessário registrar a saída antes de uma nova entrada.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {!isAlreadyInside && (
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vaga de Destino</label>
                                                <div className="relative group">
                                                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                                                    <input 
                                                        className="w-full h-12 pl-12 pr-4 bg-slate-900 border border-white/5 rounded-xl focus:border-accent/40 transition-all font-medium placeholder:text-slate-600 uppercase text-white"
                                                        placeholder="DIGITE O NÚMERO DA VAGA (EX: 05)..." 
                                                        type="text"
                                                        value={entrySpotSearch}
                                                        onChange={(e) => setEntrySpotSearch(e.target.value)}
                                                    />
                                                </div>

                                                {entrySpotSearch && (
                                                    <div className={cn(
                                                        "p-4 rounded-xl border transition-all flex items-center justify-between",
                                                        !matchedSpot && "bg-slate-800/50 border-white/5",
                                                        matchedSpot && !isSpotOccupied && "bg-emerald-500/10 border-emerald-500/20",
                                                        matchedSpot && (isSpotOccupied || isSpotReservedOrMaintenance) && "bg-rose-500/10 border-rose-500/20"
                                                    )}>
                                                        {!matchedSpot ? (
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Info size={16} />
                                                                <span className="text-xs font-bold uppercase tracking-widest">Vaga não encontrada</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-4">
                                                                    <div className={cn(
                                                                        "h-10 px-4 rounded-lg flex items-center justify-center font-black",
                                                                        !isSpotOccupied && !isSpotReservedOrMaintenance ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                                                                    )}>
                                                                        {matchedSpot.number}
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{matchedSpot.type}</span>
                                                                        </div>
                                                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                                                        <p className={cn(
                                                                            "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                                                            (!isSpotOccupied && !isSpotReservedOrMaintenance ? "text-emerald-500" : "text-rose-500")
                                                                        )}>
                                                                            <span className="text-slate-500">STATUS:</span> 
                                                                            {matchedSpot.status === 'DISPONIVEL' ? 'DISPONIVEL' : matchedSpot.status}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {(isSpotOccupied || isSpotReservedOrMaintenance) && <Ban className="opacity-50 text-rose-500" size={20} />}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <button 
                                                onClick={() => {
                                                    setManualEntryStep('search');
                                                    setEntrySpotSearch('');
                                                }}
                                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all border border-white/5"
                                            >
                                                VOLTAR
                                            </button>
                                            <button 
                                                disabled={!canConfirm}
                                                onClick={() => {
                                                    if (!canConfirm || !matchedSpot) return;

                                                    const updatedVacancies = vacancies.map(v => {
                                                        if (v.id === matchedSpot.id) {
                                                            return {
                                                                ...v,
                                                                status: 'OCUPADA' as const,
                                                                owner: selectedEmployeeForEntry.name,
                                                                plate: vehicle?.plate,
                                                                vehicle: vehicle ? vehicle.model : undefined
                                                            };
                                                        }
                                                        return v;
                                                    });
                                                    setVacancies(updatedVacancies);
                                                    localStorage.setItem('gate_e_vacancies', JSON.stringify(updatedVacancies));

                                                    setIsManualEntryOpen(false);
                                                    setManualEntryStep('search');
                                                    setSelectedEmployeeForEntry(null);
                                                    setManualSearchTerm('');
                                                    setEntrySpotSearch('');
                                                    setSelectedVacancy(null);
                                                    
                                                    addHistoryEntry({
                                                        spot: matchedSpot.number,
                                                        event: 'ENTRADA',
                                                        owner: selectedEmployeeForEntry.name,
                                                        plate: vehicle?.plate || 'S/ PLACA'
                                                    });

                                                    alert(`Entrada registrada com sucesso na vaga ${matchedSpot.number}!`);
                                                }}
                                                className={cn(
                                                    "w-full py-4 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2",
                                                    canConfirm 
                                                        ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20" 
                                                        : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                                                )}
                                            >
                                                <LogIn size={18} /> REGISTRAR
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default PortariaE;
