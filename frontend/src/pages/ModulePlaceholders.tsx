const Placeholder = ({ title }: { title: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background-dark text-slate-100">
        <h1 className="text-4xl font-black mb-4">{title}</h1>
        <p className="text-slate-400 max-w-md">
            Este módulo foi ativado recentemente. O conteúdo será implementado em breve conforme as especificações de design.
        </p>
    </div>
);

export const Patio = () => <Placeholder title="Gestão do Pátio" />;
export const Users = () => <Placeholder title="Gestão de Usuários" />;
export const Reports = () => <Placeholder title="Central de Relatórios" />;
export const Infractions = () => <Placeholder title="Registro de Infrações" />;
