import { useState, useEffect } from 'react';
import {
    Edit2,
    Search,
    Plus,
    Building2,
    Wrench,
    Truck,
    X,
    UserX,
    UserCheck
} from 'lucide-react';

import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { mockCompanies, mockProvidersList, mockProviderVehicles } from '../data/mockData';
import api from '../services/api';
import { maskCPF, maskCNPJ, maskPhone, maskPlate } from '../lib/masks';
import { validateCPF, validateCNPJ, validatePhone, validatePlate } from '../lib/validation';

const Providers = () => {
    const [view, setView] = useState<'companies' | 'providers' | 'vehicles'>('companies');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [companies, setCompanies] = useState(mockCompanies);
    const [providers, setProviders] = useState(mockProvidersList);
    const [vehicles, setVehicles] = useState(mockProviderVehicles);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [statusFilter] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');
    const [modalType, setModalType] = useState<'main' | 'provider' | 'vehicle' | 'edit'>('main');
    const [isAutonomous, setIsAutonomous] = useState(false);
    const [isPedestrian, setIsPedestrian] = useState(false);

    // Novo Prestador Special States
    const [providerName, setProviderName] = useState('');
    const [providerCpf, setProviderCpf] = useState('');
    const [providerRole, setProviderRole] = useState('');
    const [providerPhone, setProviderPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companySearch, setCompanySearch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [isAutonomousProvider, setIsAutonomousProvider] = useState(false);
    const [isPedestrianProvider, setIsPedestrianProvider] = useState(false);
    const [vPlate, setVPlate] = useState('');
    const [vModel, setVModel] = useState('');
    const [vColor, setVColor] = useState('');

    const [solicitante, setSolicitante] = useState('');
    const [destino, setDestino] = useState('');

    // Company Registration State
    const [compName, setCompName] = useState('');
    const [compCnpj, setCompCnpj] = useState('');
    const [compRole, setCompRole] = useState('');
    const [compPhone, setCompPhone] = useState('');
    const [companyResults, setCompanyResults] = useState<any[]>([]);

    // Page Search State (Table)
    const [pageSearchTerm, setPageSearchTerm] = useState('');

    // Handle internal company search for "Novo Prestador"
    useEffect(() => {
        if (companySearch.length >= 2) {
            const results = mockCompanies.filter(c =>
                c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
                c.cnpj.includes(companySearch)
            );
            setCompanyResults(results);
        } else {
            setCompanyResults([]);
        }
    }, [companySearch]);

    const handleAddMain = () => {
        setSelectedItem(null);
        setModalType('main');
        setIsAutonomous(false);
        setIsPedestrian(false);
        setSolicitante('');
        setDestino('');
        setIsModalOpen(true);
    };

    const handleAddSpecific = () => {
        setSelectedItem(null);
        if (view === 'providers') {
            setModalType('provider');
            setCompanySearch('');
            setSelectedCompany(null);
            setIsAutonomousProvider(false);
            setIsPedestrianProvider(false);
            setProviderName('');
            setProviderCpf('');
            setProviderRole('');
            setProviderPhone('');
            setVPlate('');
            setVModel('');
            setVColor('');
            setSolicitante('');
            setDestino('');
            setIsModalOpen(true);
        }
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setModalType('edit');
        setIsModalOpen(true);
    };

    const handleToggleStatus = (item: any) => {
        const updateStatus = (list: any[]) => list.map(i =>
            i.id === item.id ? { ...i, status: i.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' } : i
        );

        if (view === 'companies') setCompanies(updateStatus);
        else if (view === 'providers') setProviders(updateStatus);
        else setVehicles(updateStatus);
    };

    const handleSaveProvider = async () => {
        if (!validateCPF(providerCpf)) {
            alert('Por favor, informe um CPF válido.');
            return;
        }

        if (providerPhone && !validatePhone(providerPhone)) {
            alert('Por favor, informe um telefone completo com DDD.');
            return;
        }

        if (!providerName) {
            alert('Por favor, preencha o nome.');
            return;
        }

        if (!isAutonomousProvider && !selectedCompany) {
            alert('Por favor, selecione uma empresa ou marque como autônomo.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Criar Prestador
            const providerRes = await api.post('/contractors', {
                name: providerName,
                cpf: providerCpf,
                role: providerRole,
                phone: providerPhone,
                companyId: selectedCompany?.id || null,
                requester: solicitante,
                destination: destino
            });

            const newProvider = providerRes.data;

            // 2. Se tiver veículo, cadastra
            if (!isPedestrianProvider && vPlate) {
                if (!validatePlate(vPlate)) {
                    alert('Placa inválida. Use o formato ABC-1234 ou ABC1D23.');
                    setIsSubmitting(false);
                    return;
                }

                await api.post(`/contractors/${newProvider.id}/vehicles`, {
                    plate: vPlate,
                    model: vModel,
                    color: vColor,
                    companyId: selectedCompany?.id || null
                });
            }

            // 3. Atualizar Lista ( Ideal seria Re-fetch, mas vamos adicionar ao state para feedback imediato)
            setProviders([newProvider, ...providers]);
            setIsModalOpen(false);
            alert('Prestador cadastrado com sucesso!');

        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Erro ao salvar prestador.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveMain = async () => {
        if (!validateCPF(providerCpf)) {
            alert('CPF inválido.');
            return;
        }

        if (!isAutonomous && !validateCNPJ(compCnpj)) {
            alert('CNPJ inválido.');
            return;
        }

        if (compPhone && !validatePhone(compPhone)) {
            alert('Telefone inválido.');
            return;
        }

        if (!isAutonomous && !compName) {
            alert('Razão Social é obrigatória para empresas.');
            return;
        }

        if (!isPedestrian && vPlate && !validatePlate(vPlate)) {
            alert('Placa inválida.');
            return;
        }

        alert('Cadastro realizado com sucesso! (Integração Backend pendente para este formulário unificado)');
        setIsModalOpen(false);
    };

    const companyColumns: any[] = [
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
        { header: 'ID', accessor: 'id' },
        { header: 'Empresa', accessor: 'name', className: 'font-semibold' },
        { header: 'CNPJ/Seguimento', accessor: (item: any) => (
            <div className="flex flex-col">
                <span className="font-mono">{item.cnpj}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{item.segment || item.role}</span>
            </div>
        ) },
        { header: 'Contato', accessor: 'contact' },
        { header: 'Solicitante / Destino', accessor: (item: any) => (
            <div className="flex flex-col gap-1">
                {item.requester ? (
                    <span className="text-xs font-bold text-white uppercase">{item.requester}</span>
                ) : (
                    <span className="text-xs font-bold text-slate-500">-</span>
                )}
                {item.destination ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-white/5 text-slate-300 border border-white/10 uppercase max-w-max">
                        {item.destination}
                    </span>
                ) : (
                    <span className="text-[9px] font-bold text-slate-500 uppercase">SEM DESTINO FIXO</span>
                )}
            </div>
        ) },
    ];

    const providerColumns: any[] = [
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
            header: 'Vínculo',
            accessor: (item: any) => (
                <div className="flex items-center gap-2">
                    {item.companyId ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-accent/10 text-accent border border-accent/20">
                            {item.companyName}
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-status-warning/10 text-status-warning border border-status-warning/20">
                            AUTÔNOMO
                        </span>
                    )}
                </div>
            )
        },
        { header: 'Nome Completo', accessor: 'name', className: 'font-semibold' },
        { header: 'CPF/Cargo', accessor: (item: any) => (
            <div className="flex flex-col">
                <span>{item.cpf}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{item.role}</span>
            </div>
        ) },
        { header: 'Telefone', accessor: 'phone' },
        { header: 'Solicitante / Destino', accessor: (item: any) => (
            <div className="flex flex-col gap-1">
                {item.requester ? (
                    <span className="text-xs font-bold text-white uppercase">{item.requester}</span>
                ) : (
                    <span className="text-xs font-bold text-slate-500">-</span>
                )}
                {item.destination ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-white/5 text-slate-300 border border-white/10 uppercase max-w-max">
                        {item.destination}
                    </span>
                ) : (
                    <span className="text-[9px] font-bold text-slate-500 uppercase">SEM DESTINO FIXO</span>
                )}
            </div>
        ) },
    ];

    const vehicleColumns: any[] = [
        {
            header: 'Vínculo',
            accessor: (item: any) => (
                <div className="flex items-center gap-2">
                    {item.companyId ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-accent/10 text-accent border border-accent/20">
                            {companies.find(c => c.id === item.companyId)?.name || 'EMPRESA'}
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-status-warning/10 text-status-warning border border-status-warning/20">
                            AUTÔNOMO
                        </span>
                    )}
                </div>
            )
        },
        { header: 'ID Prestador', accessor: 'providerId' },
        { header: 'Placa', accessor: 'plate', className: 'font-mono font-bold text-accent' },
        { header: 'Modelo', accessor: 'model' },
        { header: 'Cor', accessor: 'color' },
        {
            header: 'Proprietário',
            accessor: (item: any) => {
                if (item.companyId) {
                    return companies.find(c => c.id === item.companyId)?.name || 'EMPRESA';
                }
                return item.ownerName;
            },
            className: 'font-semibold'
        },
        {
            header: 'Data de Cadastro',
            accessor: (item: any) => {
                if (!item.createdAt) return '-';
                const date = new Date(item.createdAt);
                return (
                    <div className="flex flex-col text-[10px] leading-tight opacity-80">
                        <span className="font-bold">{date.toLocaleDateString('pt-BR')}</span>
                        <span>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                );
            },
            className: 'w-32'
        },
    ];

    const currentData = view === 'companies' ? companies : view === 'providers' ? providers : vehicles;
    const currentColumns = view === 'companies' ? companyColumns : view === 'providers' ? providerColumns : vehicleColumns;

    const filteredData = currentData.filter(item => {
        const matchesStatus = statusFilter === 'TODOS' || (item as any).status === statusFilter;
        if (!matchesStatus) return false;

        const term = pageSearchTerm.toLowerCase();
        if (!term) return true;

        if (view === 'companies') {
            const comp = item as any;
            return comp.name.toLowerCase().includes(term) || comp.cnpj.includes(term);
        }

        if (view === 'providers') {
            const prov = item as any;
            return prov.name.toLowerCase().includes(term) || prov.cpf.includes(term);
        }

        if (view === 'vehicles') {
            const vh = item as any;
            return vh.plate.toLowerCase().includes(term) || vh.ownerName?.toLowerCase().includes(term);
        }

        return true;
    });

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-hidden">
            <main className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                <Wrench size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                Gestão de <span className="text-accent">Prestadores de Serviços</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
                            CONTROLE DE EMPRESAS, PRESTADORES E VEÍCULOS AUTORIZADOS
                        </p>
                    </div>
                </div>

                {/* Professional Action Row */}
                <div className="glass-card bg-slate-900/40 border border-white/5 p-2 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* 1. View Toggle (Left) */}
                    <div className="flex items-center gap-1 bg-background-dark/50 p-1 rounded-lg border border-white/5 w-full md:w-auto shrink-0">
                        {[
                            { id: 'companies', label: 'PRINCIPAL EMPRESA', icon: <Building2 size={14} /> },
                            { id: 'providers', label: 'PRESTADORES', icon: <Wrench size={14} /> },
                            { id: 'vehicles', label: 'VEÍCULOS', icon: <Truck size={14} /> }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setView(t.id as any)}
                                className={cn(
                                    "flex-1 md:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-2 transition-all",
                                    view === t.id ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* 2. Page Search (Middle) */}
                    <div className="relative flex-1 w-full max-w-md group mx-auto text-slate-100">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={`PESQUISAR ${view === 'companies' ? 'NOME OU CNPJ' : view === 'providers' ? 'NOME OU CPF' : 'PLACA OU PROPRIETÁRIO'}...`}
                            className="bg-slate-800/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs w-full focus:outline-none focus:border-accent/40 focus:bg-slate-800/60 transition-all text-white placeholder:text-slate-500 font-medium tracking-wide uppercase shadow-inner"
                            value={pageSearchTerm}
                            onChange={(e) => setPageSearchTerm(e.target.value.toUpperCase())}
                        />
                    </div>

                    {/* 3. Integrated Buttons (Right) */}
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar py-1 shrink-0">

                        {/* Specific Buttons for Tabs */}
                        {view === 'companies' && (
                            <button
                                onClick={handleAddMain}
                                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2 uppercase tracking-tight"
                            >
                                <Plus size={14} />
                                Novo Cadastro
                            </button>
                        )}

                        {view === 'providers' && (
                            <button
                                onClick={handleAddSpecific}
                                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2 uppercase tracking-tight"
                            >
                                <Plus size={14} />
                                Novo Prestador
                            </button>
                        )}

                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 min-h-0">
                    <DataTable
                        title={view === 'companies' ? 'Lista de Empresas' : view === 'providers' ? 'Lista de Prestadores' : 'Lista de Veículos'}
                        data={filteredData}
                        columns={currentColumns}
                        renderActions={(item: any) => (
                            <div className="flex items-center gap-2">
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
                                    title="Editar"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        )}
                        compact={true}
                        hideHeader={true}
                        searchTerm={pageSearchTerm}
                    />
                </div>
            </main >

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    selectedItem
                        ? `Editar ${view === 'companies' ? 'Empresa' : view === 'providers' ? 'Prestador' : 'Veículo'}`
                        : modalType === 'provider'
                            ? 'Novo Prestador'
                            : modalType === 'vehicle'
                                ? 'Novo Veículo'
                                : 'Novo Cadastro'
                }
            >
                <div className="flex flex-col gap-6 p-4">
                    {modalType === 'main' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Tipo de Cadastro</h4>
                                    <p className="text-[10px] text-slate-500">Selecione se é uma Empresa ou Autônomo</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn("text-[10px] font-bold transition-colors w-20 text-left", !isAutonomous ? "text-accent" : "text-slate-500")}>EMPRESA</span>
                                    <button
                                        onClick={() => setIsAutonomous(!isAutonomous)}
                                        className={cn(
                                            "w-10 h-5 rounded-full p-1 transition-all duration-300",
                                            isAutonomous ? "bg-status-warning" : "bg-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "size-3 bg-white rounded-full transition-all duration-300 transform",
                                            isAutonomous ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </button>
                                    <span className={cn("text-[10px] font-bold transition-colors w-20", isAutonomous ? "text-status-warning" : "text-slate-500")}>AUTÔNOMO</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Transporte</h4>
                                    <p className="text-[10px] text-slate-500">Selecione se possui veículo ou é pedestre</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn("text-[10px] font-bold transition-colors w-20 text-left", !isPedestrian ? "text-accent" : "text-slate-500")}>VEÍCULO</span>
                                    <button
                                        onClick={() => setIsPedestrian(!isPedestrian)}
                                        className={cn(
                                            "w-10 h-5 rounded-full p-1 transition-all duration-300",
                                            isPedestrian ? "bg-accent" : "bg-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "size-3 bg-white rounded-full transition-all duration-300 transform",
                                            isPedestrian ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </button>
                                    <span className={cn("text-[10px] font-bold transition-colors w-20", isPedestrian ? "text-accent" : "text-slate-500")}>PEDESTRE</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white" 
                                        placeholder="NOME DO PRESTADOR..." 
                                        value={providerName}
                                        onChange={(e) => setProviderName(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">CPF</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white font-mono" 
                                        placeholder="000.000.000-00" 
                                        value={providerCpf}
                                        onChange={(e) => setProviderCpf(maskCPF(e.target.value))}
                                    />
                                </div>

                                {!isAutonomous && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Razão Social</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white uppercase" 
                                                placeholder="NOME DA EMPRESA..." 
                                                value={compName}
                                                onChange={(e) => setCompName(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">CNPJ</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white font-mono" 
                                                placeholder="00.000.000/0001-00" 
                                                value={compCnpj}
                                                onChange={(e) => setCompCnpj(maskCNPJ(e.target.value))}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Seguimento / Cargo</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white uppercase" 
                                        placeholder="EX: TI, LIMPEZA..." 
                                        value={compRole}
                                        onChange={(e) => setCompRole(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Telefone / Contato</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white font-mono" 
                                        placeholder="(00) 00000-0000" 
                                        value={compPhone}
                                        onChange={(e) => setCompPhone(maskPhone(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Solicitante <span className="text-slate-600 lowercase capitalize">(Opcional)</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white uppercase" 
                                        placeholder="NOME DO SOLICITANTE..." 
                                        value={solicitante}
                                        onChange={(e) => setSolicitante(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Destino <span className="text-slate-600 lowercase capitalize">(Opcional)</span></label>
                                    <select 
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg text-sm p-2 text-white focus:border-accent/40 focus:outline-none transition-colors"
                                        value={destino}
                                        onChange={(e) => setDestino(e.target.value)}
                                    >
                                        <option value="">Selecione um Destino</option>
                                        <option value="ALMOXARIFADO">ALMOXARIFADO</option>
                                        <option value="MANUTENÇÃO">MANUTENÇÃO</option>
                                        <option value="LIMPEZA">LIMPEZA</option>
                                        <option value="COZINHA">COZINHA</option>
                                    </select>
                                </div>
                            </div>

                            {!isPedestrian && (
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Truck size={14} className="text-accent" />
                                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Dados do Veículo</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Placa</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white font-mono" 
                                                placeholder="XYZ-0000" 
                                                value={vPlate}
                                                onChange={(e) => setVPlate(maskPlate(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Modelo</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white uppercase" 
                                                placeholder="EX: COROLLA..." 
                                                value={vModel}
                                                onChange={(e) => setVModel(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Cor</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white uppercase" 
                                                placeholder="EX: PRATA..." 
                                                value={vColor}
                                                onChange={(e) => setVColor(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {modalType === 'provider' && (
                        <div className="space-y-6">
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="space-y-0.5">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Prestador Autônomo?</h4>
                                        <p className="text-[9px] text-slate-500">OFF: Vincula à empresa • ON: Autônomo</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsAutonomousProvider(!isAutonomousProvider);
                                            if (!isAutonomousProvider) {
                                                setSelectedCompany(null);
                                                setCompanySearch('');
                                            }
                                        }}
                                        className={cn(
                                            "w-10 h-5 rounded-full p-1 transition-all duration-300",
                                            isAutonomousProvider ? "bg-accent" : "bg-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "size-3 bg-white rounded-full transition-all duration-300 transform",
                                            isAutonomousProvider ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="space-y-0.5">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Prestador a Pé?</h4>
                                        <p className="text-[9px] text-slate-500">OFF: Com Veículo • ON: Sem Veículo</p>
                                    </div>
                                    <button
                                        onClick={() => setIsPedestrianProvider(!isPedestrianProvider)}
                                        className={cn(
                                            "w-10 h-5 rounded-full p-1 transition-all duration-300",
                                            isPedestrianProvider ? "bg-accent" : "bg-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "size-3 bg-white rounded-full transition-all duration-300 transform",
                                            isPedestrianProvider ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>
                            </div>

                            {!isAutonomousProvider && (
                                <div className="space-y-1 relative">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Pesquisar Empresa</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-800 border-white/10 rounded-lg text-sm pl-10 pr-4 py-2 text-white placeholder:text-slate-600"
                                            placeholder="BUSCAR EMPRESA CONTRATANTE..."
                                            value={selectedCompany ? selectedCompany.name : companySearch}
                                            onChange={(e) => {
                                                setCompanySearch(e.target.value.toUpperCase());
                                                setSelectedCompany(null);
                                            }}
                                        />
                                        {selectedCompany && (
                                            <button
                                                onClick={() => setSelectedCompany(null)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Company Search Results */}
                                    <AnimatePresence>
                                        {companyResults.length > 0 && !selectedCompany && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto"
                                            >
                                                {companyResults.map(comp => (
                                                    <button
                                                        key={comp.id}
                                                        onClick={() => {
                                                            setSelectedCompany(comp);
                                                            setCompanyResults([]);
                                                        }}
                                                        className="w-full p-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                                    >
                                                        <div className="size-7 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-black text-[10px]">
                                                            {comp.id}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-white truncate">{comp.name}</p>
                                                            <p className="text-[9px] text-slate-500 font-mono">{comp.cnpj}</p>
                                                        </div>
                                                        <div className="text-[9px] font-bold text-accent uppercase tracking-tighter">
                                                            SELECIONAR
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {selectedCompany && (
                                <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                                            <Building2 size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-wider">{selectedCompany.name}</p>
                                            <p className="text-[9px] text-slate-500 font-mono">ID: {selectedCompany.id} • {selectedCompany.cnpj}</p>
                                        </div>
                                    </div>
                                    <div className="bg-status-success/20 text-status-success px-2 py-0.5 rounded text-[8px] font-black uppercase">
                                        VINCULADO
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome do Prestador</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white" 
                                        placeholder="NOME..." 
                                        value={providerName}
                                        onChange={(e) => setProviderName(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">CPF</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white font-mono" 
                                        placeholder="000.000.000-00" 
                                        value={providerCpf}
                                        onChange={(e) => setProviderCpf(maskCPF(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Função / Cargo</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white" 
                                        placeholder="EX: ELETRICISTA, TI..." 
                                        value={providerRole}
                                        onChange={(e) => setProviderRole(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Telefone / Contato</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white font-mono" 
                                        placeholder="(00) 00000-0000" 
                                        value={providerPhone}
                                        onChange={(e) => setProviderPhone(maskPhone(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Solicitante <span className="text-slate-600 lowercase capitalize">(Opcional)</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white uppercase" 
                                        placeholder="NOME DO SOLICITANTE..." 
                                        value={solicitante}
                                        onChange={(e) => setSolicitante(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Destino <span className="text-slate-600 lowercase capitalize">(Opcional)</span></label>
                                    <select 
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg text-sm p-2 text-white focus:border-accent/40 focus:outline-none transition-colors"
                                        value={destino}
                                        onChange={(e) => setDestino(e.target.value)}
                                    >
                                        <option value="">Selecione um Destino</option>
                                        <option value="ALMOXARIFADO">ALMOXARIFADO</option>
                                        <option value="MANUTENÇÃO">MANUTENÇÃO</option>
                                        <option value="LIMPEZA">LIMPEZA</option>
                                        <option value="COZINHA">COZINHA</option>
                                    </select>
                                </div>
                            </div>

                            {!isPedestrianProvider && (
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Truck size={14} className="text-accent" />
                                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Dados do Veículo</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Placa</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white font-mono" 
                                                placeholder="XYZ-0000" 
                                                value={vPlate}
                                                onChange={(e) => setVPlate(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Modelo</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white" 
                                                placeholder="EX: COROLLA..." 
                                                value={vModel}
                                                onChange={(e) => setVModel(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Cor</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border-white/10 rounded-lg text-sm p-2 text-white" 
                                                placeholder="EX: PRATA..." 
                                                value={vColor}
                                                onChange={(e) => setVColor(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-6 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white/5 transition-all"
                            disabled={isSubmitting}
                        >
                            CANCELAR
                        </button>
                        <button 
                            onClick={modalType === 'provider' ? handleSaveProvider : handleSaveMain}
                            className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white px-8 py-2 rounded-lg text-xs font-black shadow-lg shadow-accent/20 transition-all uppercase tracking-widest flex items-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <span className="animate-spin material-symbols-outlined notranslate text-xs">sync</span>}
                            Salvar
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default Providers;
