import { useState } from 'react';
import {
    Users as UsersIcon,
    ShieldCheck,
    Briefcase,
    Wrench,
    Search,
    UserPlus,
    Edit2,
    UserX,
    UserCheck,
    KeyRound
} from 'lucide-react';
import { cn } from '../lib/utils';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import UserForm from '../components/forms/UserForm';

export interface User {
    id: number | string;
    name: string;
    cpf: string;
    email: string;
    role: string;
    registrationDate: string;
    status: 'ATIVO' | 'INATIVO';
    avatar: string;
}

// Mock data
const mockStats = [
    { title: 'Total de Usuários', value: '128', icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Administradores', value: '12', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Supervisores', value: '24', icon: Briefcase, color: 'text-accent', bg: 'bg-accent/10' },
    { title: 'Operadores', value: '92', icon: Wrench, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const initialUsers: User[] = [
    { id: 1, name: 'Ana Silva', cpf: '123.456.789-00', email: 'ana.silva@ebserh.gov.br', role: 'Admin', registrationDate: '10/01/2023', status: 'ATIVO', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Carlos Meira', cpf: '234.567.890-11', email: 'carlos.m@ebserh.gov.br', role: 'Supervisor', registrationDate: '15/02/2023', status: 'ATIVO', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'João Porto', cpf: '345.678.901-22', email: 'joao.p@ebserh.gov.br', role: 'Operador', registrationDate: '20/03/2023', status: 'INATIVO', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Luciana Vaz', cpf: '456.789.012-33', email: 'luciana.v@ebserh.gov.br', role: 'Operador', registrationDate: '05/04/2023', status: 'ATIVO', avatar: 'https://i.pravatar.cc/150?u=4' },
];


const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleCreateNewUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleToggleStatus = (userId: number | string) => {
        setUsers(users.map(u => {
            if (u.id === userId) {
                return { ...u, status: u.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' }
            }
            return u;
        }));
    };

    const handleSaveUser = (userData: Partial<User>) => {
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } as User : u));
        } else {
            const newUser: User = {
                id: Date.now(),
                name: userData.name || '',
                cpf: userData.cpf || '',
                email: userData.email || '',
                role: userData.role || 'Operador',
                registrationDate: new Date().toLocaleDateString('pt-BR'),
                status: userData.status || 'ATIVO',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'Novo')}&&background=random`
            };
            setUsers([newUser, ...users]);
        }
        setIsModalOpen(false);
    }

    const columns = [
        { 
            header: 'USUÁRIO', 
            accessor: (doc: User) => (

                <div className="flex items-center gap-3">
                    <img src={doc.avatar} alt={doc.name} className="size-10 rounded-full object-cover border-2 border-slate-800" />
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-sm whitespace-nowrap">{doc.name}</span>
                        <span className="text-slate-500 text-[10px] font-mono">{doc.cpf}</span>
                    </div>
                </div>
            )
        },

        { 
            header: 'E-MAIL', 
            accessor: 'email',
            className: () => 'text-xs text-slate-300 lowercase' 
        },
        { 
            header: 'PERFIL', 
            accessor: (doc: User) => (

                <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-md border tracking-wide",
                    doc.role === 'Admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    doc.role === 'Supervisor' ? "bg-accent/10 text-accent border-accent/20" :
                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}>
                    {doc.role}
                </span>
            )
        },
        { header: 'DATA DE CADASTRO', accessor: 'registrationDate', className: () => 'text-xs text-slate-400 font-mono' },
        { 
            header: 'STATUS', 
            accessor: (doc: User) => (
                <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", doc.status === 'ATIVO' ? 'bg-emerald-500' : 'bg-slate-600')} />
                    <span className={cn("text-xs font-medium", doc.status === 'ATIVO' ? 'text-emerald-500' : 'text-slate-500')}>
                        {doc.status}
                    </span>
                </div>
            )
        },
        {
            header: 'AÇÕES',
            className: () => 'text-right',
            accessor: (doc: User) => (
                <div className="flex items-center justify-end gap-1.5">
                    <button 
                        onClick={() => handleEditUser(doc)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors" 
                        title="Editar Usuário"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={() => alert(`Senha padrão (Mud@1234) definida para ${doc.name}.\\nUm e-mail informativo foi enviado para ${doc.email} com a nova senha temporária.`)}
                        className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-md text-amber-500 transition-colors" 
                        title="Resetar Senha"
                    >
                        <KeyRound size={14} />
                    </button>
                    <button 
                        onClick={() => handleToggleStatus(doc.id)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors" 
                        title={doc.status === 'ATIVO' ? 'Inativar Usuário' : 'Ativar Usuário'}
                    >
                        {doc.status === 'ATIVO' ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                </div>
            )
        }
    ];

    const filteredData = users.filter((item: User) => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cpf.includes(searchTerm)
    );


    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-hidden">
            <main className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                
                {/* Header Premium */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                <UsersIcon size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                Gestão de <span className="text-accent">Usuários</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
                            GERENCIE ACESSOS E PERMISSÕES DE TODA A EQUIPE.
                        </p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockStats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col justify-center gap-2 relative overflow-hidden group">
                                <div className="flex items-center gap-3">
                                    <div className={cn("size-8 rounded-lg flex items-center justify-center", stat.bg, stat.color)}>
                                        <Icon size={16} />
                                    </div>
                                    <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{stat.title}</h3>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{stat.value}</h2>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
                    <div className="relative flex-1 w-full max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Filtrar por nome, e-mail ou perfil..."
                            className="bg-slate-800/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs w-full focus:outline-none focus:border-accent/40 focus:bg-slate-800/60 transition-all text-white placeholder:text-slate-500 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleCreateNewUser}
                        className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
                    >
                        <UserPlus size={16} />
                        Novo Usuário
                    </button>

                </div>

                {/* Data Table */}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden -mx-6 mb-[-24px]">
                    <div className="flex-1 overflow-auto no-scrollbar px-6">
                        <DataTable title="Lista de Usuários" columns={columns as any} data={filteredData} hideHeader={true} />
                    </div>
                </div>

            </main>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? "Editar Usuário" : "Novo Cadastro de Usuário"}
            >
                <UserForm
                    initialData={editingUser || undefined}
                    onSave={handleSaveUser}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};


export default Users;
