export function errorHandler(err, _req, res, _next) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.', details: err.message });
}
