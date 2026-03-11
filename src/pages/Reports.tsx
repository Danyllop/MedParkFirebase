import { useState } from 'react';
import {
    BarChart3,
    Users,
    Clock,
    AlertTriangle,
    Filter,
    FileText,
    Download,
    Search,
    LogIn,
    LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import DataTable from '../components/ui/DataTable';

// Mock data for the reports
const mockStats = {
    totalAcessos: { value: '12.450', trend: '+12%', type: 'success' },
    mediaPermanencia: { value: '02:15h', trend: '-5%', type: 'danger' },
    infracoes: { value: '42', trend: '+2%', type: 'warning' }
};

const mockLogs = [
    { id: 1, date: '18/10/2023 - 14:22', name: 'Carlos Eduardo Souza', type: 'PRESTADOR', vehicle: 'Toyota Corolla - BRA2E19', destination: 'Bloco A - Manutenção', isCheckIn: true, operator: 'João Paulo (P-A)' },
    { id: 2, date: '18/10/2023 - 13:58', name: 'Dra. Amanda Oliveira', type: 'FUNCIONÁRIO', vehicle: 'Jeep Compass - ABC1234', destination: 'Estacionamento Médico', isCheckIn: false, operator: 'João Paulo (P-A)' },
    { id: 3, date: '18/10/2023 - 13:45', name: 'Logística Pharma S.A.', type: 'PRESTADOR', vehicle: 'Caminhão - XPTO202', destination: 'Bloco E - Almoxarifado', isCheckIn: true, operator: 'Marcos Lima (P-E)' },
    { id: 4, date: '18/10/2023 - 13:10', name: 'Ricardo Melo', type: 'FUNCIONÁRIO', vehicle: 'Honda Civic - DEF0000', destination: 'Bloco B - Cirurgia', isCheckIn: false, operator: 'João Paulo (P-A)' },
];

const Reports = () => {
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [unitFilter, setUnitFilter] = useState('Todos');
    const [typeFilter, setTypeFilter] = useState('Todos');

    const columns = [
        { header: 'DATA / HORA', accessor: 'date', className: () => 'text-xs text-slate-300' },
        { 
            header: 'NOME', 
            accessor: 'name', 
            className: () => 'font-bold text-white text-xs',
            render: (doc: any) => (
                <div className="max-w-[150px] whitespace-normal">
                    {doc.name}
                </div>
            )
        },
        { 
            header: 'TIPO', 
            accessor: 'type',
            render: (doc: any) => (
                <span className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider",
                    doc.type === 'FUNCIONÁRIO' ? "bg-accent/10 text-accent border-accent/20" :
                    doc.type === 'PRESTADOR' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                )}>
                    {doc.type}
                </span>
            )
        },
        { 
            header: 'VEÍCULO / PLACA', 
            accessor: 'vehicle',
            render: (doc: any) => {
                const parts = doc.vehicle.split(' - ');
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-slate-400 text-[10px]">{parts[0]}</span>
                        <span className="font-mono font-bold text-slate-200">{parts[1] || ''}</span>
                    </div>
                );
            }
        },
        { header: 'DESTINO', accessor: 'destination', className: () => 'text-xs text-slate-400' },
        { 
            header: 'ENTRADA/SAÍDA', 
            accessor: 'isCheckIn',
            render: (doc: any) => (
                <div className="flex items-center justify-center">
                    {doc.isCheckIn ? (
                        <span title="Entrada"><LogIn size={16} className="text-emerald-500" /></span>
                    ) : (
                        <span title="Saída"><LogOut size={16} className="text-rose-500" /></span>
                    )}
                </div>
            )
        },
        { header: 'OPERADOR', accessor: 'operator', className: () => 'text-xs text-slate-300' },
    ];

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-hidden">
            <main className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                
                {/* Header Premium */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                <BarChart3 size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                Central de <span className="text-accent">Relatórios</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
                            EXTRAÇÃO DE LOGS, AUDITORIA DE ACESSOS E RELATÓRIOS GERENCIAIS CONSOLIDADOS DO COMPLEXO HOSPITALAR.
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">TOTAL ACESSOS MÊS</h3>
                            <Users size={16} className="text-accent" />
                        </div>
                        <div className="flex items-end gap-3">
                            <h2 className="text-3xl font-black text-white">{mockStats.totalAcessos.value}</h2>
                            <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">{mockStats.totalAcessos.trend}</span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">MÉDIA PERMANÊNCIA</h3>
                            <Clock size={16} className="text-accent" />
                        </div>
                        <div className="flex items-end gap-3">
                            <h2 className="text-3xl font-black text-white">{mockStats.mediaPermanencia.value}</h2>
                            <span className="text-rose-500 text-xs font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">{mockStats.mediaPermanencia.trend}</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">INFRAÇÕES</h3>
                            <AlertTriangle size={16} className="text-accent" />
                        </div>
                        <div className="flex items-end gap-3">
                            <h2 className="text-3xl font-black text-white">{mockStats.infracoes.value}</h2>
                            <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">{mockStats.infracoes.trend}</span>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Filter size={16} className="text-accent" /> Filtros Avançados
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">DATA INÍCIO</label>
                            <input 
                                type="date" 
                                className="input-field w-full text-xs"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">DATA FIM</label>
                            <input 
                                type="date" 
                                className="input-field w-full text-xs"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">UNIDADE / BLOCO</label>
                            <select 
                                className="input-field w-full text-xs"
                                value={unitFilter}
                                onChange={(e) => setUnitFilter(e.target.value)}
                            >
                                <option>Todos</option>
                                <option>Bloco A</option>
                                <option>Bloco B</option>
                                <option>Bloco E</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">TIPO DE ACESSO</label>
                            <select 
                                className="input-field w-full text-xs"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option>Todos</option>
                                <option>Funcionário</option>
                                <option>Prestador</option>
                            </select>
                        </div>
                        <div className="h-[38px] flex">
                            <button className="flex-1 btn-primary text-xs flex items-center justify-center gap-2">
                                <Search size={14} /> Gerar Relatório
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logs Table Area */}
                <div className="flex-1 min-h-0 bg-slate-900/40 rounded-xl border border-white/5 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-background-dark/30">
                        <h2 className="text-sm font-bold text-white">Logs de Acessos Recentes</h2>
                        <div className="flex gap-2">
                            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                                <FileText size={14} /> Exportar PDF
                            </button>
                            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                                <Download size={14} /> Exportar Excel
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto no-scrollbar">
                        <DataTable title="Logs de Acessos Recentes" columns={columns as any} data={mockLogs} />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Reports;
