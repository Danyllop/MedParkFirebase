import { useState, useEffect, useRef } from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    mockEmployees, 
    mockVehicles, 
    mockCompanies, 
    mockProvidersList, 
    mockProviderVehicles 
} from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }

        const query = searchQuery.toUpperCase().trim();
        const numericQuery = query.replace(/\D/g, '');
        const plateQuery = query.replace(/-/g, '');

        // Search across all entities
        const results: any[] = [];

        // 1. Employees
        mockEmployees.forEach(emp => {
            if (emp.name.toUpperCase().includes(query) || 
                (numericQuery && emp.cpf.replace(/\D/g, '').includes(numericQuery))) {
                results.push({ ...emp, type: 'FUNCIONÁRIO', path: '/employees' });
            }
        });

        // 2. Providers
        mockProvidersList.forEach(p => {
            if (p.name.toUpperCase().includes(query) || 
                (numericQuery && p.cpf.replace(/\D/g, '').includes(numericQuery))) {
                results.push({ ...p, type: 'PRESTADOR', path: '/providers' });
            }
        });

        // 3. Companies
        mockCompanies.forEach(c => {
            if (c.name.toUpperCase().includes(query) || 
                (numericQuery && c.cnpj.replace(/\D/g, '').includes(numericQuery))) {
                results.push({ ...c, type: 'EMPRESA', path: '/providers' });
            }
        });

        // 4. Vehicles (Search by Plate)
        [...mockVehicles, ...mockProviderVehicles].forEach(v => {
            const plateVal = v.plate.replace(/-/g, '');
            if (plateVal.includes(plateQuery)) {
                // Find owner to show name
                const owner = mockEmployees.find(e => e.id === v.ownerId) || 
                              mockProvidersList.find(p => p.id === (v as any).providerId);
                
                results.push({ 
                    id: v.id, 
                    name: `${v.plate} - ${owner?.name || 'Vago'}`, 
                    type: 'VEÍCULO', 
                    path: v.ownerId ? '/employees' : '/providers',
                    subType: v.model
                });
            }
        });

        // Deduplicate and limit
        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => (t.id === v.id && t.type === v.type)) === i);
        setSearchResults(uniqueResults.slice(0, 8));
        setIsSearchOpen(true);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (path: string) => {
        navigate(path);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    return (
        <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
            <div className="flex items-center select-none hover:opacity-80 transition-opacity cursor-default">
                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-1 transition-colors hover:text-accent">
                    Powered by LogicUp Solutions
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div ref={searchRef} className="relative hidden md:block">
                    <div className="flex items-center bg-slate-800/50 rounded-lg px-3 py-1 w-80 border border-white/5 focus-within:border-accent/50 transition-all">
                        <Search size={12} className="text-slate-500" />
                        <input
                            className="bg-transparent border-none focus:ring-0 text-xs w-full placeholder:text-slate-500 ml-2 text-white"
                            placeholder="Buscar Nome, CPF, CNPJ ou Placa..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                        />
                    </div>

                    <AnimatePresence>
                        {isSearchOpen && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                            >
                                <div className="p-2 border-b border-white/5 bg-white/5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Resultados da busca</p>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {searchResults.map((result, idx) => (
                                        <button
                                            key={`${result.type}-${result.id}-${idx}`}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                            onClick={() => handleResultClick(result.path)}
                                        >
                                            <div className="size-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs shrink-0">
                                                {result.name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate uppercase">{result.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-accent font-bold px-1.5 py-0.5 bg-accent/10 rounded tracking-tighter">{result.type}</span>
                                                    <span className="text-[10px] text-slate-500 truncate">{result.subType || result.role || result.cnpj || result.cpf}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button className="p-1.5 text-slate-400 hover:text-accent transition-colors relative">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-background-dark"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-800 text-slate-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold leading-none">{user?.name}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">{user?.role}</p>
                    </div>
                    <div className="size-8 rounded-full bg-accent/20 border-2 border-accent/20 flex items-center justify-center text-accent font-bold text-xs uppercase">
                        {user?.name?.[0]}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
