import React, { useState, useEffect } from 'react';
import { Save, Building, Car, MapPin } from 'lucide-react';
import Modal from './ui/Modal';
import api from '../services/api';

interface CreateVacancyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialGate: 'A' | 'E';
}

const CreateVacancyModal: React.FC<CreateVacancyModalProps> = ({ isOpen, onClose, onSuccess, initialGate }) => {
    const [gate, setGate] = useState<'A' | 'E'>(initialGate);
    const [number, setNumber] = useState('');
    const [type, setType] = useState('COMUM');
    const [locality, setLocality] = useState('EXTERNA');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingNext, setIsLoadingNext] = useState(false);

    // Atualiza o gate ao abrir com uma aba específica
    useEffect(() => {
        if (isOpen) {
            setGate(initialGate);
            fetchNextNumber(initialGate);
        }
    }, [isOpen, initialGate]);

    const fetchNextNumber = async (selectedGate: 'A' | 'E') => {
        setIsLoadingNext(true);
        try {
            const response = await api.get(`/vacancies/next-number?gate=${selectedGate}`);
            setNumber(response.data.nextNumber);
            
            // Set defaults based on gate
            if (selectedGate === 'A') {
                setLocality('EXTERNA');
            } else {
                setLocality('AREA_1');
            }
        } catch (error) {
            console.error('Erro ao buscar próximo número:', error);
        } finally {
            setIsLoadingNext(false);
        }
    };

    const handleGateChange = (newGate: 'A' | 'E') => {
        setGate(newGate);
        fetchNextNumber(newGate);
        setType('COMUM');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/vacancies', {
                gate,
                number,
                type,
                locality
            });
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao criar vaga.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="CRIAR NOVA VAGA">
            <div className="space-y-6 py-2">
                <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => handleGateChange('A')}
                        className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            gate === 'A' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        Portaria A
                    </button>
                    <button
                        type="button"
                        onClick={() => handleGateChange('E')}
                        className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            gate === 'E' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        Portaria E
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Car size={12} /> Número da Vaga {isLoadingNext && '(Calculando...)'}
                        </label>
                        <input
                            type="text"
                            value={number}
                            readOnly
                            className="w-full h-11 px-4 bg-slate-900/50 border border-white/5 rounded-xl text-white opacity-70 cursor-not-allowed font-mono text-sm uppercase"
                            placeholder={gate === 'A' ? 'Ex: A-090' : 'Ex: E-201'}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Building size={12} /> Tipo de Vaga
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full h-11 px-4 bg-slate-900/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-accent/40 transition-all text-sm uppercase appearance-none"
                        >
                            <option value="COMUM">COMUM</option>
                            <option value="PNE">PNE</option>
                            <option value="IDOSO">IDOSO</option>
                            {gate === 'A' && <option value="DIRETORIA">DIRETORIA</option>}
                            {gate === 'E' && (
                                <>
                                    <option value="ALMOXARIFADO">ALMOXARIFADO</option>
                                    <option value="CEROF">CEROF</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <MapPin size={12} /> Localização
                        </label>
                        <select
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            className="w-full h-11 px-4 bg-slate-900/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-accent/40 transition-all text-sm uppercase appearance-none"
                        >
                            {gate === 'A' ? (
                                <>
                                    <option value="EXTERNA">EXTERNA</option>
                                    <option value="SUBSOLO_1">SUBSOLO 1</option>
                                    <option value="SUBSOLO_2">SUBSOLO 2</option>
                                </>
                            ) : (
                                <>
                                    <option value="AREA_1">ÁREA 1</option>
                                    <option value="AREA_2">ÁREA 2</option>
                                    <option value="AREA_3">ÁREA 3</option>
                                    <option value="AREA_4">ÁREA 4</option>
                                    <option value="AREA_5">ÁREA 5</option>
                                </>
                            )}
                        </select>
                    </div>
                    
                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status Inicial</label>
                        <div className="w-full h-11 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center text-xs font-black uppercase tracking-widest cursor-not-allowed opacity-80">
                            DISPONIVEL (DISPONIVEL)
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !number}
                        className="flex-1 py-3 bg-accent hover:bg-accent/90 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={14} /> Salvar Vaga
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateVacancyModal;
