import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-background-dark text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header />
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
