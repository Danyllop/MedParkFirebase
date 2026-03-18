import { useState } from 'react';
import { Trash2, Gavel, Plus, Search, Edit2, AlertCircle, MapPin, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import InfractionForm from '../components/forms/InfractionForm';

const StatCard = ({ title, value, subtitle, trend, type }: any) => (
    <div className="glass-card p-5 rounded-xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-semibold">{title}</h3>
            {trend && (
                <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 leading-none",
                    type === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                    type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                    type === 'info' ? "bg-accent/10 text-accent" :
                    type === 'primary' ? "bg-slate-500/10 text-slate-400" :
                    "bg-rose-500/10 text-rose-500"
                )}>
                    {trend}
                </span>
            )}
        </div>
        <div className="flex items-end gap-3">
            <h2 className="text-3xl font-black text-white">{value}</h2>
        </div>
        <p className="text-[10px] text-slate-500 mt-2">{subtitle}</p>
        <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            {type === 'danger' ? <MapPin size={100} /> : <AlertCircle size={100} />}
        </div>
    </div>
);

const Infractions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
    const [infractions, setInfractions] = useState<any[]>([]);

    const totalInfractions = infractions.length;
    const currentMonthInfractions = infractions.filter(i => {
        const itemDate = new Date(i.date);
        const now = new Date();
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }).length;
    const leves = infractions.filter(i => i.severity === 'LEVE').length;
    const medias = infractions.filter(i => i.severity === 'MÉDIA').length;
    const graves = infractions.filter(i => i.severity === 'GRAVE').length;

    const getPercentage = (count: number) => {
        if (totalInfractions === 0) return '0%';
        return Math.round((count / totalInfractions) * 100) + '%';
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Tem certeza que deseja deletar esta infração?")) {
            setInfractions(prev => prev.filter(inf => inf.id !== id));
        }
    };

    const columns = [
        {
            header: 'DATA',
            accessor: (doc: any) => {
                const date = new Date(doc.date);
                if (isNaN(date.getTime())) return <span className="text-slate-500">-</span>;
                return (
                    <span className="font-bold text-white text-[11px] uppercase">
                        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                );
            }
        },
        {
            header: 'HORA',
            accessor: (doc: any) => {
                const timeStr = doc.time || '';
                return (
                    <span className="text-slate-400 font-mono text-[11px]">
                        {timeStr}
                    </span>
                );
            }
        },
        { 
            header: 'INFRATOR', 
            accessor: (doc: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-white uppercase">{doc.name || 'NÃO IDENTIFICADO'}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{doc.role || '-'}</span>
                </div>
            )
        },
        { 
            header: 'PLACA', 
            accessor: (doc: any) => (
                <span className="font-mono font-bold text-accent tracking-wider">{doc.plate}</span>
            )
        },
        { 
            header: 'TIPO DE INFRAÇÃO', 
            accessor: (doc: any) => (
                <span className="font-medium text-slate-300">{doc.type}</span>
            )
        },
        { 
            header: 'LOCAL', 
            accessor: (doc: any) => (
                <span className="text-slate-400 text-xs">{doc.location}</span>
            )
        },
        {
            header: 'GRAVIDADE',
            accessor: (doc: any) => (
                <span className={cn(
                    "text-[9px] font-black px-2 py-1 rounded border uppercase tracking-wider",
                    doc.severity === 'GRAVE' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                    doc.severity === 'MÉDIA' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                )}>
                    {doc.severity}
                </span>
            )
        },
        {
            header: 'AÇÕES',
            accessor: (doc: any) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setSelectedDescription(doc.description)}
                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-md text-blue-500 transition-colors" title="Ver Detalhes">
                        <FileText size={14} />
                    </button>
                    <button className="p-1.5 bg-accent/10 hover:bg-accent/20 rounded-md text-accent transition-colors" title="Editar">
                        <Edit2 size={14} />
                    </button>
                    <button 
                         onClick={() => handleDelete(doc.id)} 
                         className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-md text-rose-500 transition-colors" title="Deletar">
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    const filteredData = infractions.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.plate && item.plate.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-hidden">
            <main className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Header Premium */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                <Gavel size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                Registro de <span className="text-accent">Infrações</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
                            GESTÃO DE OCORRÊNCIAS EM TEMPO REAL
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Nova Infração
                    </button>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard 
                        title="Total" 
                        value={totalInfractions} 
                        trend="" 
                        type="primary"
                        subtitle="Histórico Completo" 
                    />
                    <StatCard 
                        title="Mês Atual" 
                        value={currentMonthInfractions} 
                        trend={getPercentage(currentMonthInfractions)} 
                        type="info"
                        subtitle="Neste Mês" 
                    />
                    <StatCard 
                        title="Leves" 
                        value={leves} 
                        trend={getPercentage(leves)} 
                        type="success"
                        subtitle="Advertências" 
                    />
                    <StatCard 
                        title="Médias" 
                        value={medias} 
                        trend={getPercentage(medias)} 
                        type="warning"
                        subtitle="Estacionamento Irregular" 
                    />
                    <StatCard 
                        title="Graves" 
                        value={graves} 
                        trend={getPercentage(graves)} 
                        type="danger"
                        subtitle="Bloqueio Imediato" 
                    />
                </div>

                {/* Search and Filters List */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 w-full max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, placa ou local..."
                            className="bg-slate-800/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs w-full focus:outline-none focus:border-accent/40 focus:bg-slate-800/60 transition-all text-white placeholder:text-slate-500 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 min-h-0 bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto no-scrollbar">
                        <DataTable title="Registro de Infrações" columns={columns as any} data={filteredData} hideHeader={true} />
                    </div>
                    <div className="p-3 border-t border-white/5 text-xs text-slate-500 bg-background-dark/50 flex justify-between items-center">
                        <span>Mostrando {filteredData.length > 0 ? '1' : '0'}-{filteredData.length} de {totalInfractions} infrações</span>
                        {/* Pagination placeholder if needed */}
                    </div>
                </div>
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Infração">
                <InfractionForm 
                    onCancel={() => setIsModalOpen(false)} 
                    onSubmit={(data) => {
                        const newInfraction = {
                            id: Date.now(),
                            date: data.date, 
                            time: data.time,
                            name: data.vehicle.owner || data.vehicle.ownerName,
                            role: data.vehicle.role,
                            plate: data.vehicle.plate,
                            type: data.type,
                            description: data.description,
                            location: data.location || (data.gate === 'A' ? 'Portaria A' : 'Portaria E'),
                            severity: data.severity,
                        };
                        setInfractions(prev => [newInfraction, ...prev]);
                        setIsModalOpen(false);
                    }} 
                />
            </Modal>

            <Modal isOpen={!!selectedDescription} onClose={() => setSelectedDescription(null)} title="Detalhes da Infração">
                <div className="p-4 bg-slate-800/50 rounded-lg text-slate-300 whitespace-pre-wrap text-sm border border-white/5">
                    {selectedDescription || "Nenhuma descrição fornecida para esta infração."}
                </div>
                <div className="flex justify-end mt-6">
                    <button 
                        onClick={() => setSelectedDescription(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                        FECHAR
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Infractions;
