import { useState, useEffect } from 'react';
import { 
    Save, 
    Bookmark, 
    Info,
    MapPin,
    Tag,
} from 'lucide-react';
import { cn } from '../lib/utils';
import Modal from './ui/Modal';
import api from '../services/api';

interface Vacancy {
    id: string;
    number: string;
    type: string;
    locality: string;
    status: string;
    owner?: string;
}

interface EditVacancyModalProps {
    isOpen: boolean;
    onClose: () => void;
    vacancy: Vacancy | null;
    onUpdate: () => void;
}

const EditVacancyModal = ({ isOpen, onClose, vacancy, onUpdate }: EditVacancyModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        locality: '',
        type: '',
    });

    useEffect(() => {
        if (vacancy) {
            setFormData({
                locality: vacancy.locality,
                type: vacancy.type,
            });
        }
    }, [vacancy]);

    if (!vacancy) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.patch(`/vacancies/${vacancy.id}`, formData);
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar vaga:', error);
            const msg = error.response?.data?.error || error.response?.data?.details || error.message || 'Erro ao salvar alterações';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleReserve = async () => {
        if (vacancy.status === 'OCUPADA') {
            alert('Não é possível reservar uma vaga ocupada.');
            return;
        }

        setLoading(true);
        try {
            await api.patch(`/vacancies/${vacancy.id}/reserve`);
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Erro ao processar reserva:', error);
            const msg = error.response?.data?.error || error.response?.data?.details || error.message || 'Erro ao processar reserva';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const isReserved = vacancy.status === 'RESERVADA';
    const isOccupied = vacancy.status === 'OCUPADA';

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`GERENCIAR VAGA ${vacancy.number}`}
        >
            <div className="space-y-6 py-2">
                {/* Info Card */}
                <div className="p-4 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Cód. Identificador</p>
                        <p className="text-xs font-mono font-black text-white opacity-60">#{vacancy.id.toString().substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status Atual</p>
                        <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter",
                            vacancy.status === 'DISPONIVEL' ? "bg-emerald-500/10 text-emerald-500" :
                            vacancy.status === 'OCUPADA' ? "bg-rose-500/10 text-rose-500" :
                            "bg-amber-500/10 text-amber-500"
                        )}>
                            {vacancy.status === 'DISPONIVEL' ? 'DISPONIVEL' : vacancy.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Tag size={12} /> Tipo / Categoria
                        </label>
                        <select 
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full h-11 bg-slate-800 border border-white/5 rounded-xl px-4 text-xs font-bold text-white focus:border-accent/40 outline-none transition-all"
                        >
                            <option value="COMUM">COMUM</option>
                            <option value="DIRETORIA">DIRETORIA</option>
                            <option value="PNE">PNE</option>
                            <option value="IDOSO">IDOSO</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={12} /> Localização
                        </label>
                        <input 
                            type="text"
                            value={formData.locality}
                            onChange={(e) => setFormData({ ...formData, locality: e.target.value.toUpperCase() })}
                            className="w-full h-11 bg-slate-800 border border-white/5 rounded-xl px-4 text-xs font-bold text-white focus:border-accent/40 outline-none transition-all uppercase"
                            placeholder="EX: SUBSOLO 1"
                        />
                    </div>
                </div>

                {isOccupied && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                        <Info size={18} className="text-amber-500 shrink-0" />
                        <p className="text-[10px] text-amber-200/80 font-medium leading-tight">
                            Esta vaga está **OCUPADA**. Algumas alterações de status estão desabilitadas para garantir a integridade do pátio.
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full h-12 bg-white text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                    >
                        <Save size={16} /> Salvar Alterações
                    </button>

                    <button 
                        onClick={handleToggleReserve}
                        disabled={loading || isOccupied}
                        className={cn(
                            "w-full h-12 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 border-2",
                            isReserved 
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-500 hover:bg-amber-500/20"
                                : "bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700",
                            isOccupied && "opacity-50 cursor-not-allowed border-white/5"
                        )}
                    >
                        <Bookmark size={16} />
                        {isReserved ? "Remover Reserva" : "Reservar Vaga"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditVacancyModal;
