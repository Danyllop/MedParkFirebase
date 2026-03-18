import React, { useState } from 'react';
import { 
    MessageSquarePlus, 
    Bug, 
    Lightbulb, 
    Mail, 
    Send,
    LifeBuoy,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../store/AuthContext';

const Support = () => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        type: 'suggestion',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simular envio
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormData({ type: 'suggestion', subject: '', message: '' });
            
            setTimeout(() => setIsSuccess(false), 5000);
        }, 1500);
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-dark text-slate-100 overflow-y-auto no-scrollbar">
            <main className="max-w-6xl mx-auto w-full p-6 flex flex-col gap-8">
                
                {/* Header Premium */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                <LifeBuoy size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase px-1">
                                Central de <span className="text-accent">Suporte</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
                            ENVIE SUAS DÚVIDAS, REPORTE BUGS OU SUGIRA NOVAS FUNCIONALIDADES PARA O MEDPARK.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent/50 to-transparent opacity-50"></div>
                            
                            <h2 className="text-lg font-bold text-white mb-6">Como podemos ajudar?</h2>
                            
                            {isSuccess ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                                    <div className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Mensagem Enviada!</h3>
                                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                                        Recebemos sua solicitação com sucesso. Nossa equipe entrará em contato em breve através do seu email cadastrado.
                                    </p>
                                    <button 
                                        onClick={() => setIsSuccess(false)}
                                        className="mt-4 text-accent text-sm font-bold hover:underline"
                                    >
                                        Enviar nova mensagem
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Tipo de Solicitação */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo de Solicitação</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <label className={cn(
                                                "cursor-pointer flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-accent/30 transition-all",
                                                formData.type === 'suggestion' ? "bg-accent/10 border-accent/50 text-accent" : "bg-white/[0.02] text-slate-300"
                                            )}>
                                                <input 
                                                    type="radio" 
                                                    name="type" 
                                                    value="suggestion" 
                                                    className="hidden"
                                                    checked={formData.type === 'suggestion'}
                                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                                />
                                                <Lightbulb size={20} className={formData.type === 'suggestion' ? "text-accent" : "text-slate-500"} />
                                                <span className="text-sm font-bold">Sugestão / Ideia</span>
                                            </label>
                                            
                                            <label className={cn(
                                                "cursor-pointer flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-rose-500/30 transition-all",
                                                formData.type === 'bug' ? "bg-rose-500/10 border-rose-500/50 text-rose-500" : "bg-white/[0.02] text-slate-300"
                                            )}>
                                                <input 
                                                    type="radio" 
                                                    name="type" 
                                                    value="bug" 
                                                    className="hidden"
                                                    checked={formData.type === 'bug'}
                                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                                />
                                                <Bug size={20} className={formData.type === 'bug' ? "text-rose-500" : "text-slate-500"} />
                                                <span className="text-sm font-bold">Reportar Falha</span>
                                            </label>

                                            <label className={cn(
                                                "cursor-pointer flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all",
                                                formData.type === 'help' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-white/[0.02] text-slate-300"
                                            )}>
                                                <input 
                                                    type="radio" 
                                                    name="type" 
                                                    value="help" 
                                                    className="hidden"
                                                    checked={formData.type === 'help'}
                                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                                />
                                                <MessageSquarePlus size={20} className={formData.type === 'help' ? "text-emerald-500" : "text-slate-500"} />
                                                <span className="text-sm font-bold">Dúvida Geral</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Remetente (E-mail do Usuário Logado) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seu E-mail (Remetente via Sistema)</label>
                                        <div className="flex items-center gap-3 input-field w-full py-3 px-4 bg-background-dark/80 border-white/5 text-slate-400 cursor-not-allowed select-none">
                                            <Mail size={16} className="text-slate-500" />
                                            <span className="text-sm font-medium">{user?.email || 'email@naoencontrado.com'}</span>
                                        </div>
                                    </div>

                                    {/* Assunto */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assunto da Mensagem</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            placeholder="Ex: Melhoria na tela de relatórios"
                                            className="input-field w-full text-sm py-3 px-4 bg-background-dark/50 focus:border-accent/50"
                                        />
                                    </div>

                                    {/* Mensagem */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição Detalhada</label>
                                        <textarea 
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            placeholder="Descreva aqui os detalhes da sua solicitação..."
                                            className="input-field w-full text-sm py-3 px-4 bg-background-dark/50 min-h-[160px] resize-y"
                                        ></textarea>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                            ) : (
                                                <Send size={18} />
                                            )}
                                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Side Info Panel */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 text-accent/10 group-hover:text-accent/20 transition-colors duration-500">
                                <Mail size={120} />
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Precisa falar com um Humano?</h3>
                            <p className="text-sm text-slate-300 mb-6 relative z-10">
                                Para assuntos urgentes ou comerciais, sinta-se à vontade para nos enviar um e-mail diretamente.
                            </p>
                            
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-accent tracking-wider mb-1">Contato Direto</span>
                                    <a href="mailto:contato@logicupsolutions.com" className="text-white hover:text-accent transition-colors font-medium flex items-center gap-2">
                                        <Mail size={16} /> contato@logicupsolutions.com
                                    </a>
                                </div>
                                <div className="pt-4 border-t border-accent/10">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Horário de Atendimento</span>
                                    <p className="text-slate-300 text-xs mt-1">
                                        Segunda a Sexta<br />
                                        08h às 18h (Horário de Brasília)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Informações do Sistema</h3>
                            <ul className="space-y-3 text-xs">
                                <li className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-500 font-bold">Usuário Atual:</span>
                                    <span className="text-slate-300">{user?.name}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-500 font-bold">Nível de Acesso:</span>
                                    <span className="text-slate-300">{user?.role}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-500 font-bold">Versão do MedPark:</span>
                                    <span className="text-slate-300">v1.2.4 (Stable)</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-500 font-bold">Powered by:</span>
                                    <span className="text-accent font-bold">LogicUp Solutions</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Support;
