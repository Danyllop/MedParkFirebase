import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Search, 
    Download, 
    Clock, 
    User, 
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    History as HistoryIcon,
    RefreshCw,
    X,
    Shield,
    Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import api from '../services/api';
import CreateVacancyModal from '../components/CreateVacancyModal';

interface HistoryEntry {
    id: string;
    createdAt: string;
    spot: string;
    event: 'ENTRADA' | 'SAIDA' | 'RESERVA' | 'LIBERACAO';
    ownerName: string;
    ownerRole: string;
    ownerPhone?: string;
    plate: string;
    vehicleModel?: string;
    vehicleColor?: string;
    operator: {
        fullName: string;
        role: string;
    };
    vacancy?: {
        number: string;
        gate: string;
        type: string;
    };
}

const GestaoPatio = () => {
    const [searchParams] = useSearchParams();
    const initialVaga = searchParams.get('vaga') || '';
    
    const [searchTerm, setSearchTerm] = useState(initialVaga);
    const [typeFilter, setTypeFilter] = useState<'TODOS' | HistoryEntry['event']>('TODOS');
    const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/access/history', {
                params: {
                    limit: 100,
                    spot: searchTerm,
                    event: typeFilter === 'TODOS' ? undefined : typeFilter
                }
            });
            setHistoryData(response.data.data);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(loadHistory, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, typeFilter]);

    const getTypeStyle = (event: HistoryEntry['event']) => {
        switch (event) {
            case 'ENTRADA': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case 'SAIDA': return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            case 'RESERVA': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'LIBERACAO': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const getTypeIcon = (event: HistoryEntry['event']) => {
        switch (event) {
            case 'ENTRADA': return <ArrowDownLeft size={12} />;
            case 'SAIDA': return <ArrowUpRight size={12} />;
            case 'RESERVA': return <Clock size={12} />;
            case 'LIBERACAO': return <RefreshCw size={12} />;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="flex-1 flex flex-col h-full bg-background-dark p-8 overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                <HistoryIcon size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                Gestão do <span className="text-accent">Pátio</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] ml-1">Administração de Vagas e Histórico</p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                            <Plus size={16} /> NOVA VAGA
                        </button>
                        <button className="h-11 px-6 bg-accent hover:bg-accent/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-accent/20">
                            <Download size={16} /> EXPORTAR PDF
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center">
                    <div className="flex flex-1 w-full items-center gap-3">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={16} />
                            <input 
                                className="bg-slate-800/40 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-xs w-full focus:outline-none focus:border-accent/40 focus:bg-slate-800/60 transition-all text-white placeholder:text-slate-500 font-medium tracking-wide uppercase shadow-inner"
                                placeholder="PESQUISAR VAGA, PROPRIETÁRIO OU PLACA..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex h-9 p-1 bg-slate-900/50 border border-white/5 rounded-lg">
                            {[
                                { label: 'TODOS', value: 'TODOS' },
                                { label: 'ENTRADA', value: 'ENTRADA' },
                                { label: 'SAÍDA', value: 'SAIDA' },
                                { label: 'RESERVA', value: 'RESERVA' }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setTypeFilter(type.value as any)}
                                    className={cn(
                                        "px-4 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        typeFilter === type.value ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={loadHistory}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                        >
                            <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Main Content: Table */}
                <div className="flex-1 overflow-hidden glass-card bg-slate-900/40 border border-white/5 rounded-2xl shadow-2xl flex flex-col">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-900 border-b border-white/5">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data / Hora</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Vaga</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operação</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Proprietário</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cargo / Função</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Telefone</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Placa</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operador</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <div className="size-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Carregando dados...</p>
                                        </td>
                                    </tr>
                                ) : historyData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <HistoryIcon size={40} className="mx-auto mb-4 opacity-10" />
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nenhum registro encontrado</p>
                                        </td>
                                    </tr>
                                ) : (
                                    historyData.map((entry, index) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            key={entry.id}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                                        <Calendar size={14} />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-300 font-mono tracking-tighter">{formatDate(entry.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-block px-3 py-1.5 rounded-lg bg-slate-800 border border-white/5 text-[11px] font-black text-white group-hover:border-accent/40 transition-colors">
                                                    {entry.spot}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0",
                                                    getTypeStyle(entry.event)
                                                )}>
                                                    {getTypeIcon(entry.event)}
                                                    {entry.event === 'SAIDA' ? 'SAÍDA' : entry.event === 'LIBERACAO' ? 'LIBERAÇÃO' : entry.event}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-white uppercase tracking-tight">{entry.ownerName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2 py-1 bg-white/5 rounded border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {entry.ownerRole || 'NÃO INFORMADO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-bold text-slate-300">
                                                    {entry.ownerPhone || 'NÃO INFORMADO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-accent tracking-widest px-1.5 py-0.5 bg-accent/10 rounded">{entry.plate || '---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        {entry.operator?.role === 'ADMIN' && <Shield size={10} className="text-amber-500" />}
                                                        <span className="text-xs font-black text-slate-400 group-hover:text-accent transition-colors uppercase tracking-widest">
                                                            {entry.operator?.fullName.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                                                        ID: {entry.operator?.fullName ? entry.operator.fullName.substring(0, 8).toUpperCase() : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Section */}
                    {!isLoading && (
                        <div className="px-6 py-4 bg-slate-900 border-t border-white/5 flex items-center justify-between">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Auditado: <span className="text-white">{historyData.length}</span> registros carregados
                            </p>
                            <div className="flex gap-2">
                                <button className="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest transition-all">Exportar Logs</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <CreateVacancyModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    loadHistory();
                }}
                initialGate="A"
            />
        </>
    );
};

export default GestaoPatio;
