import { useModules } from '../store/ModuleContext';
import type { ModulesState } from '../store/ModuleContext';
import {
    LayoutDashboard,
    DoorOpen,
    Users,
    Wrench,
    FileBarChart,
    Gavel
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ModuleCardProps {
    id: keyof ModulesState;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    isActive: boolean;
    onToggle: (id: keyof ModulesState) => void;
    isCore?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ id, title, description, icon, category, isActive, onToggle, isCore }) => (
    <div className={cn(
        "bg-slate-900/40 border border-white/10 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:border-accent/50 transition-all group",
        !isActive && !isCore && "opacity-75 grayscale-[0.5]"
    )}>
        <div>
            <div className="flex items-start justify-between mb-3">
                <div className={cn(
                    "size-12 rounded-lg flex items-center justify-center transition-colors",
                    isActive || isCore ? "bg-accent/10 text-accent" : "bg-slate-700 text-slate-500"
                )}>
                    {icon}
                </div>
                <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border",
                    isActive || isCore
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                )}>
                    {isActive || isCore ? 'Ativo' : 'Inativo'}
                </span>
            </div>
            <h3 className="text-sm font-black mb-1 uppercase tracking-tight text-white">{title}</h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed line-clamp-3">{description}</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{category}</span>
            <label className={cn(
                "relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all duration-300",
                isActive || isCore ? "bg-accent justify-end" : "bg-slate-700 justify-start",
                isCore && "cursor-not-allowed opacity-50"
            )}>
                <div className="h-full w-[27px] rounded-full bg-white shadow-lg"></div>
                <input
                    type="checkbox"
                    className="invisible absolute"
                    checked={isActive || isCore}
                    onChange={() => !isCore && onToggle(id)}
                    disabled={isCore}
                />
            </label>
        </div>
    </div>
);

const Modules = () => {
    const { modules, toggleModule } = useModules();

    const moduleDefinitions: Omit<ModuleCardProps, 'isActive' | 'onToggle'>[] = [
        {
            id: 'dashboard',
            title: 'Painel Central',
            description: 'Visualização em tempo real de ocupação, fluxos e indicadores de desempenho da unidade.',
            icon: <LayoutDashboard size={24} />,
            category: 'Módulo Core',
            isCore: true
        },
        {
            id: 'gateA',
            title: 'Portaria Principal (A)',
            description: 'Controle rigoroso de entrada e saída de pacientes e visitantes pelo acesso norte.',
            icon: <DoorOpen size={24} />,
            category: 'Acesso'
        },
        {
            id: 'gateE',
            title: 'Portaria Secundária (E)',
            description: 'Gestão de fluxos para áreas de serviço e docas de suprimentos.',
            icon: <DoorOpen size={24} />,
            category: 'Acesso'
        },
        {
            id: 'employees',
            title: 'Gestão de Equipes',
            description: 'Cadastro de colaboradores, escalas de trabalho e controle de ponto biométrico.',
            icon: <Users size={24} />,
            category: 'RH'
        },
        {
            id: 'providers',
            title: 'Terceirizados',
            description: 'Acompanhamento de prestadores de serviço e empresas de manutenção externa.',
            icon: <Wrench size={24} />,
            category: 'Serviços'
        },
        {
            id: 'reports',
            title: 'Central de Relatórios',
            description: 'Extração de logs, auditoria de acessos e relatórios gerenciais consolidados.',
            icon: <FileBarChart size={24} />,
            category: 'BI'
        },
        {
            id: 'infractions',
            title: 'Registro de Infrações',
            description: 'Módulo para registro de não-conformidades e violações das normas da unidade.',
            icon: <Gavel size={24} />,
            category: 'Compliance'
        }
    ];

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-hidden">
            <main className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase">Gestão de Funcionalidades</h1>
                    <p className="text-slate-400 text-xs">Ative ou desative as ferramentas do sistema de acordo com a operação da unidade. Alterações nos módulos afetam o acesso de todos os usuários em tempo real.</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {moduleDefinitions.map((module) => (
                            <ModuleCard
                                key={module.id}
                                {...module}
                                isActive={modules[module.id]}
                                onToggle={toggleModule}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Modules;
