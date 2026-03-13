import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    DoorOpen,
    UserCog,
    LogOut,
    Settings,
    CircleHelp,
    Car,
    Wrench,
    Gavel,
    Hospital,
    ChevronLeft,
    ChevronRight,
    FileBarChart,
    History
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useModules } from '../store/ModuleContext';
import type { ModulesState } from '../store/ModuleContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface NavItem {
    name: string;
    icon: React.ReactNode;
    path: string;
    moduleKey: keyof ModulesState;
    section?: string;
}

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const { modules } = useModules();

    const isOperator = user?.role === 'OPERADOR';

    const navItems: NavItem[] = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', moduleKey: 'dashboard' },
        { name: 'Funcionários', icon: <Users size={20} />, path: '/employees', moduleKey: 'employees' },
        { name: 'Prestadores', icon: <Wrench size={20} />, path: '/providers', moduleKey: 'providers' },

        { section: 'CONTROLE DE ACESSO', name: 'Portaria A', icon: <Car size={20} />, path: '/gate-a', moduleKey: 'gateA' },
        { section: 'CONTROLE DE ACESSO', name: 'Portaria E', icon: <DoorOpen size={20} />, path: '/gate-e', moduleKey: 'gateE' },
        { section: 'CONTROLE DE ACESSO', name: 'Gestão do Pátio', icon: <History size={20} />, path: '/gestao-patio', moduleKey: 'patio' },

        { section: 'ADMINISTRATIVO', name: 'Usuários', icon: <UserCog size={20} />, path: '/users', moduleKey: 'users' },
        { section: 'ADMINISTRATIVO', name: 'Infrações', icon: <Gavel size={20} />, path: '/infractions', moduleKey: 'infractions' },
        { section: 'ADMINISTRATIVO', name: 'Relatórios', icon: <FileBarChart size={20} />, path: '/reports', moduleKey: 'reports' },
    ];

    let filteredItems = navItems.filter(item => modules[item.moduleKey]);

    if (isOperator) {
        // Operator only sees Gate A, Gate E, and Gestão do Pátio (formerly History)
        const allowedPaths = ['/gate-a', '/gate-e', '/gestao-patio'];
        filteredItems = filteredItems.filter(item => allowedPaths.includes(item.path));
    }

    const groupedItems = filteredItems.reduce((acc, item) => {
        const section = item.section || 'MAIN';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? '80px' : '260px' }}
            className="h-screen bg-slate-900/50 border-r border-slate-800 flex flex-col sticky top-0 z-50 overflow-hidden"
        >
            {/* Header / Logo */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-accent rounded-lg p-2 flex items-center justify-center shrink-0">
                        <Hospital size={20} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col overflow-hidden"
                        >
                            <h1 className="text-white text-base font-bold leading-none">MedPark</h1>
                            <p className="text-slate-400 text-[10px] mt-1 whitespace-nowrap">Gestão Hospitalar</p>
                        </motion.div>
                    )}
                </div>
                {!isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 hover:bg-white/5 rounded-md text-slate-400 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}
                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-1.5 hover:bg-white/5 rounded-md text-slate-400 absolute right-4 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-6 py-4 overflow-y-auto no-scrollbar">
                {Object.entries(groupedItems).map(([section, items]) => (
                    <div key={section} className="space-y-1">
                        {!isCollapsed && section !== 'MAIN' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 mt-4"
                            >
                                {section}
                            </motion.p>
                        )}
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={isCollapsed ? item.name : undefined}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-accent/20 text-accent border-l-4 border-accent"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <span className="shrink-0">{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                        {item.name}
                                    </span>
                                )}
                                {isCollapsed && (
                                    <div className="absolute left-[-4px] w-[4px] h-6 bg-accent rounded-r-sm opacity-0 group-[.active]:opacity-100" />
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 space-y-1">
                <NavLink
                    to="/modules"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all",
                        isActive && "text-white bg-slate-800",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <Settings size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
                </NavLink>

                {!isCollapsed && (
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                        <CircleHelp size={20} />
                        <span className="text-sm font-medium">Suporte</span>
                    </button>
                )}

                <button
                    onClick={logout}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors mt-2",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
