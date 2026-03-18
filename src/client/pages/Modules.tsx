import { useState, useEffect } from 'react';
import { useModules } from '../store/ModuleContext';
import type { ModulesState } from '../store/ModuleContext';
import {
    LayoutDashboard,
    DoorOpen,
    Users,
    Wrench,
    FileBarChart,
    Gavel,
    ShieldCheck,
    Truck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

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
        "bg-slate-900/40 border border-white/10 p-4 rounded-xl flex flex-col justify-between shadow-sm hover:border-accent/50 transition-all group",
        !isActive && !isCore && "opacity-75 grayscale-[0.5]"
    )}>
        <div>
            <div className="flex items-start justify-between mb-2">
                <div className={cn(
                    "size-10 rounded-lg flex items-center justify-center transition-colors [&>svg]:size-5",
                    isActive || isCore ? "bg-accent/10 text-accent" : "bg-slate-700 text-slate-500"
                )}>
                    {icon}
                </div>
                <span className={cn(
                    "px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border",
                    isActive || isCore
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                )}>
                    {isActive || isCore ? 'Ativo' : 'Inativo'}
                </span>
            </div>
            <h3 className="text-sm font-black mb-0.5 uppercase tracking-tight text-white">{title}</h3>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed line-clamp-2">{description}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
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
    const { modules, updateModules } = useModules();
    const [tempModules, setTempModules] = useState<ModulesState>(modules);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync local state if global state changes (unlikely in this flow but good for consistency)
    useEffect(() => {
        setTempModules(modules);
    }, [modules]);

    // Check for changes
    useEffect(() => {
        const changed = JSON.stringify(modules) !== JSON.stringify(tempModules);
        setHasChanges(changed);
    }, [tempModules, modules]);

    const handleToggle = (id: keyof ModulesState) => {
        setTempModules(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleSave = () => {
        updateModules(tempModules);
        toast.success('Configurações salvas com sucesso!', {
            style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)'
            }
        });
    };

    const handleDiscard = () => {
        setTempModules(modules);
        toast.error('Alterações descartadas.', {
            style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)'
            }
        });
    };

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
            title: 'Portaria (A)',
            description: 'Interface dedicada para controle de fluxo específico de Servidores e membros da Diretoria.',
            icon: <DoorOpen size={24} />,
            category: 'Acesso'
        },
        {
            id: 'gateE',
            title: 'Portaria (E)',
            description: 'Controle de entradas logísticas (Almoxarifado, CEROF, Manutenção) e fluxo de entregas pesadas.',
            icon: <DoorOpen size={24} />,
            category: 'Acesso'
        },
        {
            id: 'patio',
            title: 'Gestão do Pátio',
            description: 'Controle de ocupação em tempo real, gestão de vagas rotativas e fluxo interno de veículos.',
            icon: <Truck size={24} />,
            category: 'Logística'
        },
        {
            id: 'employees',
            title: 'Funcionários',
            description: 'Cadastro completo de servidores e seus veículos vinculados, suportando acessos provisórios e permanentes.',
            icon: <Users size={24} />,
            category: 'RH'
        },
        {
            id: 'providers',
            title: 'Prestadores',
            description: 'Gestão de empresas terceirizadas e prestadores avulsos. Controle de veículos e acesso de pedestres.',
            icon: <Wrench size={24} />,
            category: 'Serviços'
        },
        {
            id: 'users',
            title: 'Gestão de Usuários',
            description: 'Administração de contas de acesso e definição de perfis (Admin, Supervisor e Operador).',
            icon: <ShieldCheck size={24} />,
            category: 'Sistema'
        },
        {
            id: 'reports',
            title: 'Central de Relatórios',
            description: 'Geração de logs de auditoria, históricos de acesso e relatórios gerenciais para exportação.',
            icon: <FileBarChart size={24} />,
            category: 'BI'
        },
        {
            id: 'infractions',
            title: 'Registro de Infrações',
            description: 'Documentação de não-conformidades, infrações de trânsito interno e violação de normas hospitalares.',
            icon: <Gavel size={24} />,
            category: 'Compliance'
        }
    ];

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-hidden">
            <main className="px-6 py-4 flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase">Gestão de Funcionalidades</h1>
                    <p className="text-slate-400 text-xs text-balance max-w-2xl">
                        Ative ou desative as ferramentas do sistema de acordo com a operação da unidade. Alterações nos módulos afetam o acesso de todos os usuários em tempo real.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {moduleDefinitions.map((module) => (
                            <ModuleCard
                                key={module.id}
                                {...module}
                                isActive={tempModules[module.id]}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={cn(
                    "flex justify-end gap-3 pt-3 mt-2 border-t border-white/5 transition-all duration-300",
                    !hasChanges ? "opacity-50 pointer-events-none grayscale" : "opacity-100"
                )}>
                    <button 
                        onClick={handleDiscard}
                        className="px-6 py-2.5 text-xs font-black text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest"
                    >
                        Descartar Alterações
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-accent hover:bg-accent/90 text-white px-8 py-2.5 rounded-lg text-xs font-black shadow-lg shadow-accent/20 transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        Salvar Configurações
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Modules;

