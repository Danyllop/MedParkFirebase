import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ModulesState {
    dashboard: boolean; // Always true
    employees: boolean;
    providers: boolean;
    gateA: boolean;
    gateE: boolean;
    patio: boolean;
    users: boolean;
    infractions: boolean;
    reports: boolean;
    settings: boolean; // Always true
}

interface ModuleContextType {
    modules: ModulesState;
    toggleModule: (module: keyof ModulesState) => void;
    updateModules: (newModules: ModulesState) => void;
}

const defaultState: ModulesState = {
    dashboard: true,
    employees: true,
    providers: true,
    gateA: true,
    gateE: true,
    patio: false, // Default to false for testing
    users: true,
    infractions: false,
    reports: true,
    settings: true,
};

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [modules, setModules] = useState<ModulesState>(() => {
        const saved = localStorage.getItem('medpark_modules');
        return saved ? { ...defaultState, ...JSON.parse(saved), dashboard: true, settings: true } : defaultState;
    });

    useEffect(() => {
        localStorage.setItem('medpark_modules', JSON.stringify(modules));
    }, [modules]);

    const toggleModule = (module: keyof ModulesState) => {
        // dashboard and settings are core and can't be toggled off
        if (module === 'dashboard' || module === 'settings') return;

        setModules(prev => ({
            ...prev,
            [module]: !prev[module]
        }));
    };

    const updateModules = (newModules: ModulesState) => {
        setModules(newModules);
    };

    return (
        <ModuleContext.Provider value={{ modules, toggleModule, updateModules }}>
            {children}
        </ModuleContext.Provider>
    );
};

export const useModules = () => {
    const context = useContext(ModuleContext);
    if (context === undefined) {
        throw new Error('useModules must be used within a ModuleProvider');
    }
    return context;
};
