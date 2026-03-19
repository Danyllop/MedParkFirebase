# MedPark - Gestão de Estacionamento Hospitalar

![MedPark Banner](https://img.shields.io/badge/Status-Development-orange)
![Cloudflare Workers](https://img.shields.io/badge/Backend-Hono%20%28Edge%29-blue)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TS-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)

**MedPark** é uma solução SaaS de alta performance para a gestão inteligente de pátios e estacionamentos hospitalares. O sistema é uma aplicação monorepo nativa da Cloudflare, utilizando tecnologias Edge para latência mínima e alta escalabilidade.

---

## 🚀 Tecnologias Utilizadas

### Frontend (Cloudflare Pages)
- **Framework:** React 19 com TypeScript.
- **Build:** Vite 7.
- **Estilização:** TailwindCSS v4 & Vanilla CSS.
- **Estado:** React Context API & Axios.

### Backend (Cloudflare Workers)
- **Framework:** Hono (Ultrafast web framework for the Edge).
- **Runtime:** Cloudflare Workers (V8 Isolate).
- **Banco de Dados:** PostgreSQL via Prisma Client (Edge Runtime).
- **Segurança:** Web Cryptography API (PBKDF2) para hashing de senhas.
- **Autenticação:** JWT (Stateless).

---

## 📋 Especificações Funcionais

### 1. Níveis de Acesso
- **ADMIN:** Controle total, gestão de usuários e logs globais.
- **SUPERVISOR:** Gestão de operadores e cadastros permanentes.
- **OPERADOR:** Foco operacional (entrada/saída e cadastros temporários).

### 2. Regras de Negócio
- **Validação Anti-passback:** Bloqueio de entrada duplicada para o mesmo veículo.
- **Gestão de Vagas:** Regras específicas por categoria (PNE, Idoso, Diretoria, Almoxarifado).
- **Sincronização Edge:** CRUDs otimizados para execução em isolados V8.

---

## 📁 Estrutura do Monorepo

```text
MedPark_Saas/
├── frontend/           # Aplicação React (Cloudflare Pages)
│   ├── src/
│   │   ├── components/ # Componentes de UI e Layout
│   │   ├── pages/      # Páginas da aplicação
│   │   └── services/   # Integração com o Backend (Axios)
│   └── public/         # Ativos estáticos
├── backend/            # API Hono (Cloudflare Workers)
│   ├── src/
│   │   ├── routes/     # Rotas da API refatoradas para Hono
│   │   └── middleware/ # Autenticação e Guards Edge-compatible
│   ├── prisma/         # Esquema e Migrações (Edge Client)
│   └── wrangler.toml   # Configuração de deploy Cloudflare
└── package.json        # Configuração de workspaces NPM
```

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js (v20 ou superior)
- NPM (v7+ para suporte a workspaces)

### Configuração e Desenvolvimento
1. **Instalação Global**:
   ```bash
   npm install
   ```

2. **Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### Build e Deploy
O projeto está preparado para o ecossistema Cloudflare:

- **Frontend**: Deploy automático via **Cloudflare Pages** conectando à pasta `/frontend`.
- **Backend**: Deploy via **Wrangler** a partir da pasta `/backend`:
  ```bash
  npx wrangler deploy
  ```

---

## 👤 Autor
**Danyllo Jonathas Cunha Pereira**  
*Atualizado em: 18/03/2026*
