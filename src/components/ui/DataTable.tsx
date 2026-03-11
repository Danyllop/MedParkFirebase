import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    title: string;
    description?: string;
    onAdd?: () => void;
    addLabel?: string;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    renderActions?: (item: T) => React.ReactNode;
    searchPlaceholder?: string;
    extraFilters?: React.ReactNode;
    compact?: boolean;
    pageSize?: number;
    hideHeader?: boolean;
    searchTerm?: string;
}

const DataTable = <T extends { id: string | number }>({
    data,
    columns,
    title,
    description,
    onAdd,
    addLabel = 'Novo',
    onEdit,
    onDelete,
    renderActions,
    searchPlaceholder = 'Pesquisar...',
    extraFilters,
    compact = true,
    pageSize = 10,
    hideHeader = false,
    searchTerm: externalSearchTerm
}: DataTableProps<T>) => {
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
    const setSearchTerm = externalSearchTerm !== undefined ? () => { } : setInternalSearchTerm;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, data]);

    const filteredData = data.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchStr)
        );
    });

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    {description && <p className="text-text-secondary">{description}</p>}
                </div>
                {onAdd && (
                    <button onClick={onAdd} className="btn-primary shadow-lg shadow-accent/20">
                        <Plus size={20} />
                        {addLabel}
                    </button>
                )}
            </div>

            {!hideHeader && (
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
                        <div className="flex flex-wrap items-center gap-2">
                            {extraFilters}
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="input-field w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className={cn("card overflow-hidden", hideHeader && "border-white/5")}>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                                {columns.map((col, idx) => (
                                    <th key={idx} className={cn(compact ? "px-4 py-3" : "px-6 py-4", col.className)}>
                                        {col.header}
                                    </th>
                                ))}
                                {(onEdit || onDelete || renderActions) && <th className={cn(compact ? "px-4 py-3" : "px-6 py-4", "text-right")}>Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                        {columns.map((col, idx) => (
                                            <td key={idx} className={cn(
                                                "text-sm whitespace-nowrap",
                                                compact ? "px-4 py-2" : "px-6 py-4",
                                                col.className
                                            )}>
                                                {typeof col.accessor === 'function'
                                                    ? col.accessor(item)
                                                    : (item[col.accessor] as React.ReactNode)}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete || renderActions) && (
                                            <td className={cn(compact ? "px-4 py-2" : "px-6 py-4", "text-right")}>
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {renderActions && renderActions(item)}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(item)}
                                                            className="p-1.5 hover:bg-accent/10 text-accent rounded-button transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(item)}
                                                            className="p-1.5 hover:bg-status-error/10 text-status-error rounded-button transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-text-secondary italic">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-text-secondary bg-white/[0.01]">
                    <span>
                        Mostrando {filteredData.length > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length} registros
                    </span>
                    <div className="flex items-center gap-4">
                        <span className="text-xs">Página {currentPage} de {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="p-2 hover:bg-white/5 rounded-button disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="p-2 hover:bg-white/5 rounded-button disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
