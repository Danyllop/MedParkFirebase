import { useState } from 'react';
import {
    Gavel,
    Plus,
    Search,
    Eye,
    Edit2,
    TrendingUp,
    AlertCircle,
    MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import InfractionForm from '../components/forms/InfractionForm';

// Mock data to be moved later
const mockInfractions = [
    { id: 1, date: '2023-10-14T14:25:00', plate: 'ABC-1234', type: 'Vaga Reservada (Deficiente)', location: 'Bloco A - Portaria Principal', severity: 'GRAVE' },
    { id: 2, date: '2023-10-14T12:10:00', plate: 'XYZ-9876', type: 'Estacionamento Irregular', location: 'Bloco E - Subsolo 1', severity: 'MÉDIA' },
    { id: 3, date: '2023-10-14T09:45:00', plate: 'JKL-5566', type: 'Excesso de Velocidade', location: 'Acesso Principal', severity: 'LEVE' },
    { id: 4, date: '2023-10-13T22:30:00', plate: 'MHQ-2290', type: 'Obstrução de Via', location: 'Bloco B - Emergência', severity: 'GRAVE' },
];

const StatCard = ({ title, value, subtitle, trend, type }: any) => (
    <div className="glass-card p-5 rounded-xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-semibold">{title}</h3>
            {trend && (
                <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                    type === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                    type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                    "bg-rose-500/10 text-rose-500"
                )}>
                    {type === 'success' ? <TrendingUp size={12} /> : null}
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

    const columns = [
        {
            header: 'DATA/HORA',
            accessor: 'date',
            render: (doc: any) => {
                const date = new Date(doc.date);
                return (
                    <div className="flex flex-col text-[11px] font-medium leading-tight text-slate-300">
                        <span className="font-bold text-white">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-slate-500">{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                );
            }
        },
        { 
            header: 'PLACA', 
            accessor: 'plate',
            className: () => 'font-mono font-bold text-accent tracking-wider'
        },
        { header: 'TIPO DE INFRAÇÃO', accessor: 'type', className: () => 'font-medium text-slate-300' },
        { header: 'LOCAL', accessor: 'location', className: () => 'text-slate-400 text-xs' },
        {
            header: 'GRAVIDADE',
            accessor: 'severity',
            render: (doc: any) => (
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
            accessor: 'id',
            render: () => (
                <div className="flex items-center gap-2">
                    <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                        <Eye size={14} />
                    </button>
                    <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 hover:text-accent transition-colors">
                        <Edit2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    const filteredData = mockInfractions.filter(item => 
        item.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                        title="Total de Infrações (Mês)" 
                        value="142" 
                        trend="~ 12%" 
                        type="success"
                        subtitle="Em comparação com 126 no mês passado" 
                    />
                    <StatCard 
                        title="Pendentes de Resolução" 
                        value="28" 
                        trend="~ 5%" 
                        type="warning"
                        subtitle="Aguardando revisão do administrador" 
                    />
                    <StatCard 
                        title="Área Crítica" 
                        value="Vaga Reservada" 
                        trend="CRÍTICO" 
                        type="danger"
                        subtitle="Bloco B (Emergência) com maior volume" 
                    />
                </div>

                {/* Search and Filters List */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 w-full max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por placa ou descrição..."
                            className="bg-slate-800/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs w-full focus:outline-none focus:border-accent/40 focus:bg-slate-800/60 transition-all text-white placeholder:text-slate-500 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 min-h-0 bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto no-scrollbar">
                        <DataTable title="Registro de Infrações" columns={columns as any} data={filteredData} />
                    </div>
                    <div className="p-3 border-t border-white/5 text-xs text-slate-500 bg-background-dark/50 flex justify-between items-center">
                        <span>Mostrando 1-{filteredData.length} de 142 infrações</span>
                        {/* Pagination placeholder if needed */}
                    </div>
                </div>
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Infração">
                <InfractionForm 
                    onCancel={() => setIsModalOpen(false)} 
                    onSubmit={(data) => {
                        console.log('Nova infração:', data);
                        setIsModalOpen(false);
                    }} 
                />
            </Modal>
        </div>
    );
};

export default Infractions;
