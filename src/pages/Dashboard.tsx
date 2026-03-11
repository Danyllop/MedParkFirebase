import {
    Car,
    DoorOpen,
    CircleParking,
    AlertTriangle,
    LogIn,
    LogOut,
    History,
    ArrowUpRight,
    ArrowDownRight,
    LayoutDashboard
} from 'lucide-react';
import { useModules } from '../store/ModuleContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, percentage, icon: Icon, color, trend, subtitle }: any) => (
    <div className="glass-card p-4 rounded-xl flex flex-col justify-between h-full bg-slate-900/40 border border-white/10">
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className={cn("p-1.5 rounded-lg", color)}>
                    <Icon size={18} className="text-white" />
                </div>
                {percentage && (
                    <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5",
                        trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                        {trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {percentage}
                    </span>
                )}
            </div>
            <p className="text-slate-400 text-xs font-medium">{title}</p>
            <p className="text-2xl font-bold mt-0.5 text-white">{value}</p>
        </div>

        {title === "Ocupação Total" && (
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: value }}
                    className="bg-accent h-1 rounded-full"
                />
            </div>
        )}

        {subtitle && (
            <p className={cn(
                "text-[10px] mt-2",
                title === "Portarias Ativas" ? "text-emerald-500 flex items-center gap-1.5" : "text-slate-500"
            )}>
                {title === "Portarias Ativas" && <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                {subtitle}
            </p>
        )}

        {title === "Infrações Hoje" && (
            <p className="text-[10px] text-slate-500 mt-2 underline cursor-pointer hover:text-accent transition-colors">
                Ver todos os alertas
            </p>
        )}
    </div>
);

const ActivityItem = ({ title, subtitle, time, icon: Icon, color }: any) => (
    <div className="flex gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
        <div className={cn("size-8 rounded-full flex items-center justify-center shrink-0", color)}>
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-slate-200">{title}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{subtitle} • {time}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { modules } = useModules();

    const activeGatesCount = [modules.gateA, modules.gateE].filter(Boolean).length;
    const totalGates = 2;

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-hidden">
            {/* Main Content */}
            <div className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                <LayoutDashboard size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                Dashboard <span className="text-accent">Geral</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">VISÃO EM TEMPO REAL DA OCUPAÇÃO E OPERAÇÕES</p>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Ocupação Total"
                        value="87%"
                        percentage="5.2%"
                        trend="up"
                        icon={Car}
                        color="bg-accent/20 text-accent"
                    />
                    <StatCard
                        title="Portarias Ativas"
                        value={`${activeGatesCount} / ${totalGates}`}
                        icon={DoorOpen}
                        color="bg-amber-500/20 text-amber-500"
                        subtitle={activeGatesCount > 0 ? "Sistema operacional" : "Sistema offline"}
                    />
                    <StatCard
                        title="Vagas Disponíveis"
                        value="156"
                        percentage="2.1%"
                        trend="down"
                        icon={CircleParking}
                        color="bg-emerald-500/20 text-emerald-500"
                        subtitle="Total de 1.200 vagas"
                    />
                    <StatCard
                        title="Infrações Hoje"
                        value="12"
                        percentage="3%"
                        trend="up"
                        icon={AlertTriangle}
                        color="bg-rose-500/20 text-rose-500"
                    />
                </div>

                {/* Sub-metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-xl bg-slate-900/40 border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-slate-400 text-xs font-medium">Ocupação Portaria A</p>
                            <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded">Estável</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <p className="text-2xl font-black text-white">74%</p>
                            <div className="flex-1 bg-slate-800 h-1.5 rounded-full mb-1.5 overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[74%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-xl bg-slate-900/40 border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-slate-400 text-xs font-medium">Ocupação Portaria E</p>
                            <span className="text-[10px] font-bold text-amber-500 px-2 py-0.5 bg-amber-500/10 rounded">Alta</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <p className="text-2xl font-black text-white">92%</p>
                            <div className="flex-1 bg-slate-800 h-1.5 rounded-full mb-1.5 overflow-hidden">
                                <div className="bg-amber-500 h-full w-[92%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    {/* Area Occupancy */}
                    <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden flex flex-col bg-slate-900/40 border border-white/10 h-full">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-sm text-white uppercase tracking-tight">Ocupação por Área</h3>
                            <div className="flex gap-2">
                                <button className="px-2 py-0.5 text-[10px] rounded-lg bg-accent text-white font-black uppercase">Ao Vivo</button>
                                <button className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors font-bold uppercase">Histórico</button>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            {[
                                { name: 'Bloco de Internação', value: '81%', sub: 'Vagas Livres: 22', color: 'accent' },
                                { name: 'Bloco Ambulatorial', value: '72%', sub: 'Vagas Livres: 48', color: 'emerald' }
                            ].map((block) => (
                                <div key={block.name} className="bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center p-4 text-center group hover:bg-white/10 transition-colors flex-1">
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{block.name}</p>
                                    <p className="text-4xl font-black text-white">{block.value}</p>
                                    <p className="text-slate-500 text-xs mt-1">{block.sub}</p>
                                    <div className="mt-4 w-full bg-slate-800 h-1 rounded-full overflow-hidden max-w-[120px]">
                                        <div className={cn(
                                            "h-full rounded-full animate-pulse",
                                            block.color === 'accent' ? "bg-accent" : "bg-emerald-500"
                                        )} style={{ width: block.value }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="glass-card rounded-xl flex flex-col bg-slate-900/40 border border-white/10 h-full min-h-0">
                        <div className="p-4 border-b border-white/5">
                            <h3 className="font-bold text-sm text-white uppercase tracking-tight">Atividade Recente</h3>
                        </div>
                        <div className="p-2 space-y-1 flex-1 overflow-hidden">
                            <ActivityItem
                                title="Veículo ABC-1234 Entrou"
                                subtitle="Portaria A"
                                time="Agora mesmo"
                                icon={LogIn}
                                color="bg-emerald-500/20 text-emerald-500"
                            />
                            <ActivityItem
                                title="Vaga PNE Ocupada Indevidamente"
                                subtitle="Internação"
                                time="5 min atrás"
                                icon={AlertTriangle}
                                color="bg-rose-500/20 text-rose-500"
                            />
                            <ActivityItem
                                title="Saída Dr. Henrique"
                                subtitle="Portaria E"
                                time="12 min atrás"
                                icon={LogOut}
                                color="bg-accent/20 text-accent"
                            />
                            <ActivityItem
                                title="Ambulância SAMU Entrou"
                                subtitle="Internação"
                                time="18 min atrás"
                                icon={LogIn}
                                color="bg-emerald-500/20 text-emerald-500"
                            />
                            <ActivityItem
                                title="Relatório Diário Gerado"
                                subtitle="Sistema"
                                time="1 hora atrás"
                                icon={History}
                                color="bg-slate-500/20 text-slate-400"
                            />
                        </div>
                        <div className="p-3 border-t border-white/5 text-center">
                            <button className="text-[10px] font-bold text-accent hover:underline uppercase tracking-tight">Ver log completo</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
