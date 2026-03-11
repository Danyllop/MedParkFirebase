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
    Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';

interface Vacancy {
    id: number;
    number: string;
    type: 'DIRETORIA' | 'COMUM' | 'PNE' | 'IDOSO';
    status: 'LIVRE' | 'OCUPADA' | 'RESERVADA' | 'MANUTENCAO';
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

    // Initialize 260 spots
    useEffect(() => {
        const initialVacancies: Vacancy[] = Array.from({ length: 260 }, (_, i) => {
            let status: Vacancy['status'] = 'LIVRE';
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
            } else if (i === 50) {
                status = 'MANUTENCAO';
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
    }, []);

    const stats = useMemo(() => ({
        total: vacancies.length,
        disponiveis: vacancies.filter(v => v.status === 'LIVRE').length,
        reservadas: vacancies.filter(v => v.status === 'RESERVADA').length,
        ocupadas: vacancies.filter(v => v.status === 'OCUPADA').length,
        manutencao: vacancies.filter(v => v.status === 'MANUTENCAO').length
    }), [vacancies]);

    const filteredVacancies = vacancies.filter(v => {
        const matchesSearch = v.number.includes(searchTerm.toUpperCase()) ||
                            v.owner?.includes(searchTerm.toUpperCase()) ||
                            v.plate?.includes(searchTerm.toUpperCase());
        const matchesDestination = filterDestination === '' || v.destination === filterDestination;
        const matchesType = typeFilter === 'TODOS' || v.type === typeFilter;
        return matchesSearch && matchesDestination && matchesType;
    });

    const getSpotStyle = (vacancy: Vacancy) => {
        switch (vacancy.status) {
            case 'LIVRE': return "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/10";
            case 'OCUPADA': return "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:border-rose-500/40";
            case 'RESERVADA': return "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:border-amber-500/40";
            case 'MANUTENCAO': return "bg-slate-800 border-slate-700 text-slate-500 opacity-50";
            default: return "bg-slate-800/50 border-white/5 text-slate-400";
        }
    };

    const getStatusIcon = (status: Vacancy['status']) => {
        switch (status) {
            case 'LIVRE': return <CheckCircle2 size={14} className="opacity-40" />;
            case 'OCUPADA': return <Car size={14} className="fill-current" />;
            case 'RESERVADA': return <Bookmark size={14} className="fill-current" />;
            case 'MANUTENCAO': return <Ban size={14} />;
            default: return null;
        }
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
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-accent/40 transition-all text-white appearance-none font-bold uppercase tracking-widest"
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
                                { label: 'Ocupadas', value: stats.ocupadas, color: 'bg-rose-500', ring: 'ring-rose-500/20' },
                                { label: 'Manutenção', value: stats.manutencao, color: 'bg-slate-500', ring: 'ring-slate-500/20' }
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
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 xl:grid-cols-16 2xl:grid-cols-20 gap-3 pb-8">
                        {filteredVacancies.map((vacancy) => {
                            const isSelected = selectedVacancy?.id === vacancy.id;
                            
                            return (
                                <motion.button
                                    key={vacancy.id}
                                    whileHover={{ y: -1, scale: 1.05 }}
                                    onClick={() => setSelectedVacancy(vacancy)}
                                    className={cn(
                                        "aspect-square flex flex-col items-center justify-center border rounded-lg transition-all relative group",
                                        getSpotStyle(vacancy),
                                        isSelected && "ring-2 ring-accent ring-offset-2 ring-offset-background-dark border-accent"
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs font-black tracking-tighter opacity-80 transition-transform",
                                        vacancy.owner && "-translate-y-1.5"
                                    )}>
                                        {vacancy.number.split('-')[1]}
                                    </span>
                                    {vacancy.owner && (
                                        <span className="text-[7px] font-black text-white/90 uppercase tracking-tighter w-full text-center truncate px-0.5 absolute bottom-1.5">
                                            {vacancy.owner.split(' ').slice(0, 2).join(' ')}
                                        </span>
                                    )}
                                    <div className="absolute top-0 right-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {getStatusIcon(vacancy.status)}
                                    </div>
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
                                                        vacancy.status === 'LIVRE' ? "bg-emerald-500" : 
                                                        vacancy.status === 'OCUPADA' ? "bg-rose-500" : 
                                                        vacancy.status === 'RESERVADA' ? "bg-amber-500" : "bg-slate-500"
                                                    )}></div>
                                                    <span className="text-sm font-black text-white">{vacancy.number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                                    PÁTIO
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portaria E</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    vacancy.status === 'LIVRE' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                                    vacancy.status === 'OCUPADA' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                    vacancy.status === 'MANUTENCAO' ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                                                    "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                )}>
                                                    {vacancy.status === 'LIVRE' ? 'DISPONÍVEL' : vacancy.status}
                                                </span>
                                            </td>
                                            {canManageSpots && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            disabled={vacancy.status !== 'LIVRE'}
                                                            onClick={(e) => { e.stopPropagation(); /* TODO: Implement Edit */ }}
                                                            className={cn(
                                                                "p-1.5 flex items-center justify-center rounded transition-colors",
                                                                vacancy.status === 'LIVRE' 
                                                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                                                                    : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                                                            )}
                                                            title={vacancy.status === 'LIVRE' ? "Editar Vaga" : "Vaga não pode ser Editada"}
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button 
                                                            disabled={vacancy.status !== 'LIVRE'}
                                                            onClick={(e) => { e.stopPropagation(); /* TODO: Implement Reserve */ }}
                                                            className={cn(
                                                                "p-1.5 flex items-center justify-center rounded transition-colors",
                                                                vacancy.status === 'LIVRE'
                                                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-500"
                                                                    : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                                                            )}
                                                            title={vacancy.status === 'LIVRE' ? "Reservar Vaga" : "Vaga não pode ser Reservada"}
                                                        >
                                                            <Bookmark size={14} />
                                                        </button>
                                                        {isAdmin && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); /* TODO: Implement Delete */ }}
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
                                    Vaga {selectedVacancy.status === 'OCUPADA' ? 'Ocupada' : selectedVacancy.status === 'RESERVADA' ? 'Reservada' : selectedVacancy.status === 'MANUTENCAO' ? 'Em Manutenção' : 'Disponível'}
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
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Proprietário / Empresa</p>
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
                                    
                                    <button className="w-full mt-4 py-4 bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3">
                                        Liberar Vaga
                                    </button>
                                </>
                            ) : selectedVacancy.status === 'LIVRE' ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                    <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 size={32} className="opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-300">Vaga Disponível</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Pronta para nova entrada de serviço.</p>
                                    </div>
                                    <button className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all border border-emerald-500/20 flex items-center justify-center gap-3">
                                        <LogIn size={16} /> Entrada Manual
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                    <div className="size-16 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500">
                                        <Ban size={32} className="opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-300">Indisponível</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Esta vaga está em manutenção ou reservada para carga/descarga.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5">
                            <button 
                                onClick={() => navigate(`/history?vaga=${selectedVacancy.number}`)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Info size={14} /> Ver Histórico
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortariaE;
