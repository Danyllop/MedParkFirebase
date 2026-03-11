import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Search, 
    Download, 
    Clock, 
    User, 
    Car, 
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    History as HistoryIcon,
    RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

import { historyData as mockHistoryData } from '../data/mockData';

interface HistoryEntry {
    id: number;
    timestamp: string;
    spot: string;
    event: 'ENTRADA' | 'SAÍDA' | 'RESERVA' | 'LIBERAÇÃO';
    owner: string;
    plate: string;
    operator: string;
}

const History = () => {
    const [searchParams] = useSearchParams();
    const initialVaga = searchParams.get('vaga') || '';
    
    const [searchTerm, setSearchTerm] = useState(initialVaga);
    const [typeFilter, setTypeFilter] = useState<'TODOS' | HistoryEntry['event']>('TODOS');

    const historyData = useMemo(() => mockHistoryData as HistoryEntry[], []);

    const filteredHistory = historyData.filter(entry => {
        const matchesSearch = 
            entry.spot.toUpperCase().includes(searchTerm.toUpperCase()) ||
            entry.owner.toUpperCase().includes(searchTerm.toUpperCase()) ||
            entry.plate.toUpperCase().includes(searchTerm.toUpperCase());
        
        const matchesType = typeFilter === 'TODOS' || entry.event === typeFilter;
        
        return matchesSearch && matchesType;
    });

    const getTypeStyle = (event: HistoryEntry['event']) => {
        switch (event) {
            case 'ENTRADA': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case 'SAÍDA': return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            case 'RESERVA': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'LIBERAÇÃO': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const getTypeIcon = (event: HistoryEntry['event']) => {
        switch (event) {
            case 'ENTRADA': return <ArrowDownLeft size={12} />;
            case 'SAÍDA': return <ArrowUpRight size={12} />;
            case 'RESERVA': return <Clock size={12} />;
            case 'LIBERAÇÃO': return <RefreshCw size={12} />;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-dark p-8 overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                            <HistoryIcon size={22} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                            Auditoria de <span className="text-accent">Vagas</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] ml-1">Histórico completo de movimentos e reservas</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
                    <button className="h-11 px-5 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <Calendar size={16} /> Últimos 30 Dias
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
                            className="bg-slate-800/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs w-full focus:outline-none focus:border-accent/40 focus:bg-slate-800/60 transition-all text-white placeholder:text-slate-500 font-medium tracking-wide uppercase shadow-inner"
                            placeholder="PESQUISAR VAGA, PROPRIETÁRIO OU PLACA..." 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="flex h-9 p-1 bg-slate-900/50 border border-white/5 rounded-lg">
                        {['TODOS', 'ENTRADA', 'SAÍDA', 'RESERVA'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type as any)}
                                className={cn(
                                    "px-4 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    typeFilter === type ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content: Table */}
            <div className="flex-1 overflow-hidden glass-card bg-slate-900/40 border border-white/5 rounded-2xl shadow-2xl flex flex-col">
                <div className="overflow-y-auto no-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-900 border-b border-white/5">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data / Hora</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Vaga</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operação</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Proprietário / Empresa</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo / Placa</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operador</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredHistory.map((entry, index) => (
                                <motion.tr 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={entry.id}
                                    className="group hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                                <Calendar size={14} />
                                            </div>
                                            <span className="text-xs font-medium text-slate-300 lining-nums">{entry.timestamp}</span>
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
                                            {entry.event}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-white uppercase tracking-tight">{entry.owner}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <Car size={14} className="text-slate-500" />
                                                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">{entry.plate}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-medium uppercase truncate max-w-[150px]">{entry.owner}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black text-slate-400 group-hover:text-accent transition-colors uppercase tracking-widest">{entry.operator}</span>
                                            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">ID: OP-0012</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="px-6 py-4 bg-slate-900 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Exibindo <span className="text-white">{filteredHistory.length}</span> resultados de <span className="text-white">{mockHistoryData.length}</span>
                    </p>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-600 text-[10px] font-black uppercase tracking-widest opacity-50">Anterior</button>
                        <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest transition-all">Próximo</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
