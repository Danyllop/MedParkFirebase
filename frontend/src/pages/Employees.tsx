import { useState, useEffect } from 'react';
import {
    Star,
    StarOff,
    Edit2,
    UserX,
    UserCheck,
    XCircle,
    Search,
    Plus,
    Users,
    Car,
    Filter
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import EmployeeForm from '../components/forms/EmployeeForm';
import VehicleForm from '../components/forms/VehicleForm';
import { cn } from '../lib/utils';
import { employeeService } from '../services/firebase/employee.service';
import { vehicleService } from '../services/firebase/vehicle.service';
import { toast } from 'react-hot-toast';

const Employees = () => {
    const [view, setView] = useState<'employees' | 'vehicles'>('employees');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [vehicleFilter, setVehicleFilter] = useState<'total' | 'principal' | 'secundario'>('total');
    const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');
    const [typeFilter, setTypeFilter] = useState<'TODOS' | 'PERMANENTE' | 'PROVISÓRIO'>('TODOS');

    // Page Search State (Table)
    const [pageSearchTerm, setPageSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empData, vehData] = await Promise.all([
                employeeService.getAll(),
                vehicleService.getAll()
            ]);
            setEmployees(empData);
            setVehicles(vehData);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const getExpiryClass = (expirationDate?: any, registrationType?: string) => {
        if (registrationType !== 'PROVISÓRIO' || !expirationDate) return "";

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = expirationDate instanceof Date ? expirationDate : new Date(expirationDate);
        expDate.setHours(0, 0, 0, 0);

        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return "text-status-error font-bold animate-pulse";
        if (diffDays < 7) return "text-status-warning font-bold";
        return "";
    };

    const handleToggleStatus = async (employee: any) => {
        try {
            const newStatus = employee.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
            await employeeService.update(employee.id, { status: newStatus });
            toast.success(`Funcionário ${newStatus === 'ATIVO' ? 'ativado' : 'inativado'}!`);
            fetchData();
        } catch (error) {
            toast.error("Erro ao alterar status.");
        }
    };

    const handleTogglePrincipal = async (vehicle: any) => {
        if (vehicle.isPrincipal) return;
        try {
            await vehicleService.togglePrincipal(vehicle.id, vehicle.employeeId);
            toast.success("Veículo principal alterado!");
            fetchData();
        } catch (error) {
            toast.error("Erro ao alterar veículo principal.");
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            if (view === 'employees') {
                if (selectedItem) {
                    await employeeService.update(selectedItem.id, data);
                    toast.success("Funcionário atualizado!");
                } else {
                    await employeeService.create(data);
                    toast.success("Funcionário cadastrado!");
                }
            } else {
                if (selectedItem) {
                    await vehicleService.update(selectedItem.id, data);
                    toast.success("Veículo atualizado!");
                } else {
                    await vehicleService.create(data);
                    toast.success("Veículo cadastrado!");
                }
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar.");
        }
    };

    const employeeColumns: any[] = [
        {
            header: 'Situação',
            accessor: (item: any) => (
                <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold",
                    item.status === 'ATIVO' ? "bg-status-success/10 text-status-success border border-status-success/20" : "bg-status-error/10 text-status-error border border-status-error/20"
                )}>
                    {item.status}
                </span>
            )
        },
        { header: 'ID Registro', accessor: 'id', className: (item: any) => getExpiryClass(item.expirationDate, item.registrationType) },
        {
            header: 'Nome',
            accessor: 'name',
            className: (item: any) => cn('font-semibold', getExpiryClass(item.expirationDate, item.registrationType))
        },
        {
            header: 'Tipo', accessor: (item: any) => (
                <span className={cn("text-[10px] font-bold", getExpiryClass(item.expirationDate, item.registrationType))}>
                    {item.registrationType || 'PERMANENTE'}
                </span>
            )
        },
        { header: 'CPF', accessor: 'cpf', className: (item: any) => getExpiryClass(item.expirationDate, item.registrationType) },
        { header: 'Cargo', accessor: 'position', className: (item: any) => getExpiryClass(item.expirationDate, item.registrationType) },
        { header: 'Lotação', accessor: 'unit', className: (item: any) => getExpiryClass(item.expirationDate, item.registrationType) },
        { header: 'Vínculo', accessor: 'bond', className: (item: any) => getExpiryClass(item.expirationDate, item.registrationType) },
        { header: 'Telefone', accessor: 'phone', className: (item: any) => getExpiryClass(item.expirationDate, item.registrationType) },
    ];

    const filteredEmployees = employees.filter(emp => {
        const matchesStatus = statusFilter === 'TODOS' || emp.status === statusFilter;
        const matchesType = typeFilter === 'TODOS' || (emp as any).registrationType === typeFilter;
        return matchesStatus && matchesType;
    });

    const vehicleColumns: any[] = [
        {
            header: 'Principal',
            accessor: (item: any) => (
                <div className="flex justify-center">
                    {item.isPrincipal ? (
                        <div title="Principal">
                            <Star size={16} className="text-status-warning fill-status-warning" />
                        </div>
                    ) : (
                        <div className="w-4" />
                    )}
                </div>
            ),
            className: 'w-10 text-center'
        },
        {
            header: 'Situação',
            accessor: (item: any) => (
                <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold",
                    item.status === 'ATIVO' ? "bg-status-success/10 text-status-success border border-status-success/20" : "bg-status-error/10 text-status-error border border-status-error/20"
                )}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Placa',
            accessor: 'plate',
            className: (item: any) => {
                const owner = employees.find(e => e.id === item.ownerId);
                return cn('font-mono font-bold text-accent', getExpiryClass(owner?.expirationDate, owner?.registrationType));
            }
        },
        {
            header: 'Proprietário',
            accessor: 'owner',
            className: (item: any) => {
                const owner = employees.find(e => e.id === item.ownerId);
                return cn('font-semibold', getExpiryClass(owner?.expirationDate, owner?.registrationType));
            }
        },
        {
            header: 'Modelo',
            accessor: 'model',
            className: (item: any) => {
                const owner = employees.find(e => e.id === item.ownerId);
                return getExpiryClass(owner?.expirationDate, owner?.registrationType);
            }
        },
        {
            header: 'Cor',
            accessor: 'color',
            className: (item: any) => {
                const owner = employees.find(e => e.id === item.ownerId);
                return getExpiryClass(owner?.expirationDate, owner?.registrationType);
            }
        },
        {
            header: 'Data de Cadastro',
            accessor: (item: any) => {
                if (!item.createdAt) return '-';
                const date = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
                const owner = employees.find(e => e.id === (item.ownerId || item.employeeId));
                return (
                    <div className={cn("flex flex-col text-[10px] leading-tight opacity-80", getExpiryClass(owner?.expirationDate, owner?.registrationType))}>
                        <span className="font-bold">{date.toLocaleDateString('pt-BR')}</span>
                        <span>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                );
            },
            className: 'w-32'
        },
    ];

    const filteredVehicles = vehicles.filter(v => {
        if (vehicleFilter === 'principal') return v.isPrincipal;
        if (vehicleFilter === 'secundario') return !v.isPrincipal;
        return true;
    });

    const VehicleFilters = (
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/5">
            {[
                { id: 'total', label: 'TOTAL' },
                { id: 'principal', label: 'PRINCIPAL' },
                { id: 'secundario', label: 'SECUNDÁRIO' }
            ].map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => setVehicleFilter(filter.id as any)}
                    className={cn(
                        "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all",
                        vehicleFilter === filter.id
                            ? filter.id === 'principal'
                                ? "bg-status-warning text-white shadow-sm"
                                : filter.id === 'secundario'
                                    ? "bg-white/40 text-background-primary shadow-sm"
                                    : "bg-accent text-white shadow-sm"
                            : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    )}
                >
                    {filter.label}
                </button>
            ))}
            <button
                onClick={() => setVehicleFilter('total')}
                className="p-1 text-text-secondary hover:text-status-error transition-colors ml-1"
                title="Limpar Filtros"
            >
                <XCircle size={18} />
            </button>
        </div>
    );

    const EmployeeFilters = (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/5">
                {['TODOS', 'ATIVO', 'INATIVO'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status as any)}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all",
                            statusFilter === status
                                ? "bg-accent text-white shadow-sm"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                        )}
                    >
                        {status}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/5">
                {['TODOS', 'PERMANENTE', 'PROVISÓRIO'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setTypeFilter(type as any)}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all",
                            typeFilter === type
                                ? "bg-accent text-white shadow-sm"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-hidden">
            <main className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                {view === 'employees' ? <Users size={22} /> : <Car size={22} />}
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                {view === 'employees'
                                    ? <>Gestão de <span className="text-accent">Funcionários</span></>
                                    : <>Gestão de <span className="text-accent">Veículos</span></>}
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
                            {view === 'employees'
                                ? 'GERENCIAMENTO COMPLETO DOS COLABORADORES E PERMISSÕES'
                                : 'CONTROLE E VISUALIZAÇÃO DE TODOS OS VEÍCULOS CADASTRADOS'}
                        </p>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        {view === 'employees' ? 'Novo Funcionário' : 'Novo Veículo'}
                    </button>
                </div>

                {/* Professional Action Row */}
                <div className="glass-card bg-slate-900/40 border border-white/5 p-2 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* 1. View Toggle (Left) */}
                    <div className="flex items-center gap-1 bg-background-dark/50 p-1 rounded-lg border border-white/5 w-full md:w-auto shrink-0">
                        <button
                            onClick={() => setView('employees')}
                            className={cn(
                                "flex-1 md:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-2 transition-all",
                                view === 'employees' ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Users size={14} />
                            FUNCIONÁRIOS
                        </button>
                        <button
                            onClick={() => setView('vehicles')}
                            className={cn(
                                "flex-1 md:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-2 transition-all",
                                view === 'vehicles' ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Car size={14} />
                            VEÍCULOS
                        </button>
                    </div>

                    {/* 2. Page Search (Middle - Better Visibility) */}
                    <div className="relative flex-1 w-full max-w-md group mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="PESQUISAR NESTA LISTA..."
                            className="bg-slate-800/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs w-full focus:outline-none focus:border-accent/40 focus:bg-slate-800/60 transition-all text-white placeholder:text-slate-500 font-medium tracking-wide uppercase shadow-inner"
                            value={pageSearchTerm}
                            onChange={(e) => setPageSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* 3. Integrated Filters (Right) */}
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar py-1 shrink-0">
                        <div className="flex items-center gap-2 text-slate-500 pr-1">
                            <Filter size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Filtros</span>
                        </div>

                        {view === 'employees' ? EmployeeFilters : VehicleFilters}

                        {/* Clear Filters Button */}
                        <button
                            onClick={() => {
                                setStatusFilter('TODOS');
                                setTypeFilter('TODOS');
                                setVehicleFilter('total');
                                setPageSearchTerm('');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-all group hover:border-status-error/30"
                            title="Limpar todos os filtros"
                        >
                            <XCircle size={14} className="text-status-error group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-status-error">LIMPAR</span>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 min-h-0">
                    <DataTable
                        title={view === 'employees' ? 'Lista de Funcionários' : 'Lista de Veículos'}
                        data={view === 'employees' ? filteredEmployees : filteredVehicles}
                        columns={view === 'employees' ? employeeColumns : vehicleColumns}
                        renderActions={(item: any) => (
                            <div className="flex items-center gap-2">
                                {view === 'vehicles' ? (
                                    <>
                                        <button
                                            onClick={() => handleTogglePrincipal(item)}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-all border",
                                                item.isPrincipal
                                                    ? "text-status-warning bg-status-warning/10 border-status-warning/20 shadow-sm cursor-default"
                                                    : "text-text-secondary hover:text-status-warning hover:bg-status-warning/10 border-transparent"
                                            )}
                                            title={item.isPrincipal ? "Veículo Principal" : "Definir como Principal"}
                                        >
                                            {item.isPrincipal ? <Star size={14} className="fill-current" /> : <StarOff size={14} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1.5 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-all border border-transparent"
                                            title="Editar Veículo"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleToggleStatus(item)}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-all border",
                                                item.status === 'ATIVO'
                                                    ? "text-status-error hover:bg-status-error/10 border-transparent"
                                                    : "text-status-success hover:bg-status-success/10 border-transparent"
                                            )}
                                            title={item.status === 'ATIVO' ? "Inativar" : "Ativar"}
                                        >
                                            {item.status === 'ATIVO' ? <UserX size={14} /> : <UserCheck size={14} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1.5 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-all border border-transparent"
                                            title="Editar Funcionário"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                        compact={true}
                        hideHeader={true}
                        searchTerm={pageSearchTerm}
                    />
                </div>
            </main>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? `Editar ${view === 'employees' ? 'Funcionário' : 'Veículo'}` : `Cadastrar Novo ${view === 'employees' ? 'Funcionário' : 'Veículo'}`}
            >
                {view === 'employees' ? (
                    <EmployeeForm
                        initialData={selectedItem}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsModalOpen(false)}
                    />
                ) : (
                    <VehicleForm
                        initialData={selectedItem}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsModalOpen(false)}
                        employees={employees}
                    />
                )}
            </Modal>
        </div>
    );
};

export default Employees;
