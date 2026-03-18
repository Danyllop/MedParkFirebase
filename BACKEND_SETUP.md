# MedPark — Guia de Inicialização do Backend

> **Usar quando:** Reconectar o banco de dados (Neon PostgreSQL ou local) e reiniciar o backend do zero.

---

## 📋 Pré-requisitos

- Node.js v18+
- PostgreSQL disponível (Neon ou local)
- `backend/.env` configurado com a `DATABASE_URL` correta

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/medpark?sslmode=require"
JWT_SECRET="medpark-jwt-secret-2026-change-in-production"
JWT_EXPIRES_IN="24h"
PORT=3333
DEFAULT_PASSWORD="Mud@1234"
```

---

## 🚀 Sequência de Inicialização

Execute dentro da pasta `backend/`:

```bash
# 1. Criar as tabelas no banco
npm run db:push

# 2. Criar usuário admin + funcionários e veículos base
npm run db:seed

# 3. Gerar as 90 vagas da Portaria A
npm run db:generate-a-vagas

# 4. Gerar as 200 vagas da Portaria E
npm run db:generate-e-vagas

# 5. Iniciar o servidor
npm run dev
```

---

## 🏛️ Estrutura de Dados Inicializada

| Recurso | Qtd | Detalhes |
|---|---|---|
| **Admin** | 1 | `admin@medpark.com` / senha: `Admin@0502` |
| **Funcionários** | 2 | Alan Fernandes + Danyllo Pereira (com veículos) |
| **Vagas Portaria A** | 90 | A-001 → A-090 (EXTERNA, SUBSOLO_1, SUBSOLO_2) |
| **Vagas Portaria E** | 200 | E-001 → E-200 (5 PNE + 5 IDOSO + 190 COMUM, 5 Áreas) |

---

## ⚠️ Dados do Frontend (localStorage)

Durante o desenvolvimento sem banco, as vagas foram salvas no **localStorage do browser**:
- `gate_a_vacancies` — estado das vagas da Portaria A
- `gate_e_vacancies` — estado das vagas da Portaria E
- `access_history` / `gate_e_history` — histórico de movimentações

Ao conectar o banco, o frontend passará a usar a API automaticamente.  
Se quiser preservar histórico local, exporte antes via **Gestão do Pátio → Exportar Logs**.

---

## 🔌 Conexão do Frontend

Com o backend rodando, o frontend em `http://localhost:5173` conecta automaticamente em `http://localhost:3333/v1`.

Para **desativar o Mock Mode** (que foi ativado temporariamente):
```ts
// src/services/api.ts — linha 12
const USE_MOCKS = false; // ← alterar de true para false
```
