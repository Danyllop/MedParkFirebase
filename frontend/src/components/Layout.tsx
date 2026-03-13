import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    const location = useLocation();
    
    // Simple title mapping
    const getPageTitle = () => {
        if (location.pathname === '/employees') return 'Funcionários & Veículos';
        if (location.pathname === '/providers') return 'Prestadores & Serviços';
        if (location.pathname === '/gate-a') return 'Portaria A';
        if (location.pathname === '/gate-e') return 'Portaria E';
        if (location.pathname === '/history') return 'Auditoria de Vagas';
        if (location.pathname === '/modules') return 'Módulos do Sistema';
        if (location.pathname === '/') return 'Dashboard Geral';
        return 'MedPark';
    };

    return (
        <div className="flex min-h-screen bg-background-dark text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header title={getPageTitle()} />
                <main className="flex-1 overflow-auto bg-background-dark">
                    <div className="w-full h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
