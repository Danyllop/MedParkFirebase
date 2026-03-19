import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AvatarSelectorProps {
    currentAvatar: string;
    userName: string;
    onSelect: (avatar: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ currentAvatar, userName, onSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset error
        setError(null);

        // Limit to 5MB
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            setError('O arquivo é muito grande. O limite máximo é 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Compress image using canvas
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 150;
                const MAX_HEIGHT = 150;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convert back to base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                onSelect(dataUrl);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const removeAvatar = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect('');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Foto de Perfil <span className="text-slate-500 lowercase font-normal">(Opcional)</span>
                </label>
                {currentAvatar && (
                    <button 
                        type="button"
                        onClick={removeAvatar}
                        className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-bold uppercase"
                    >
                        <X size={10} /> Remover Foto
                    </button>
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5 transition-all hover:border-white/10">
                {/* Current Preview */}
                <div 
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className={cn(
                        "size-24 rounded-full overflow-hidden border-2 transition-all shadow-xl",
                        currentAvatar ? "border-accent/40 shadow-accent/5" : "border-slate-800 bg-slate-900"
                    )}>
                        {currentAvatar ? (
                            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <img 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || 'U')}&backgroundColor=1e293b,0f172a&fontWeight=700`} 
                                alt="Placeholder" 
                                className="w-full h-full opacity-60 transition-opacity group-hover:opacity-100" 
                            />
                        )}
                    </div>
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                        <Upload size={20} className="text-white" />
                    </div>

                    <button 
                        type="button"
                        className="absolute -bottom-1 -right-1 size-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                    >
                        <Camera size={14} />
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*" 
                    />
                </div>

                {/* Guidelines */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="text-sm font-semibold text-slate-200">Personalize seu perfil</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[280px]">
                        Clique no círculo para fazer upload de sua foto. 
                        Recomendamos uma imagem clara, **focada no rosto**, para melhor identificação no sistema.
                    </p>
                    
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-800/30 px-3 py-1.5 rounded-lg border border-white/5 w-fit mx-auto sm:mx-0">
                        <Info size={12} className="text-accent/60" />
                        <span>Arquivos JPEG/PNG até 5MB</span>
                    </div>

                    {error && (
                        <p className="text-[10px] text-red-400 font-bold animate-pulse">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvatarSelector;
