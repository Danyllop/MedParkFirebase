# MedPark - Gestão de Estacionamento Hospitalar

![MedPark Banner](https://img.shields.io/badge/Status-Development-orange)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TS-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)

**MedPark** é uma solução SaaS de alta performance para a gestão inteligente de pátios e estacionamentos hospitalares. O sistema foca em controle de fluxo em tempo real, gestão de vagas por regramentos específicos e monitoramento de prestadores e funcionários.

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **Framework:** React 19 com TypeScript.
- **Ferramentas de Build:** Vite (HMR ultra-rápido).
- **Estilização:** Vanilla CSS & TailwindCSS (Design Moderno e Responsivo).
- **Ícones:** Phosphor Icons & Lucide React.
- **Animações:** Framer Motion.
- **Roteamento:** React Router Dom v7.
- **Gerenciamento de Estado:** React Context API (Auth e Módulos).

### Backend & Infra (Arquitetura)
- **Runtime:** Node.js (NestJS).
- **Banco de Dados:** PostgreSQL (Persistência) & Redis (Cache de KPIs e tempo real).
- **Comunicação:** WebSockets (Socket.io) para atualizações de pátio ao vivo.
- **Autenticação:** JWT com segurança BCrypt.

---

## 📋 Especificações Funcionais

### 1. Níveis de Acesso
- **ADMIN:** Controle total do sistema, incluindo gestão de usuários e logs.
- **SUPERVISOR:** Gestão de operadores e criação de cadastros permanentes.
- **OPERADOR:** Foco operacional nas portarias; permissão para cadastros temporários (30 dias).

### 2. Módulos Operacionais
- **Portaria A (Diretoria):** 90 vagas. Regras de acesso exclusivo para diretores (Seg-Sex, 06h-18h).
- **Portaria E (Geral/Almoxarifado):** 260 vagas. Fluxo validado para prestadores e entregas.
- **Dashboard em Tempo Real:** Visão consolidada de ocupação, indicadores por categoria (CLT, Prestador, Residente) e gráficos de pátio.

### 3. Regras de Negócio (Integridade)
- **Funcionários:** Regras rígidas (1 CPF = 1 Registro; 1 Placa = 1 Veículo).
- **Adesivos (Stickers):** Lógica sequencial automática (iniciando em 11.000) ou manual para legado.
- **Prestadores:** Regras flexíveis para frotas e substituições técnicas rápidas (Permite múltiplos veículos por placa para reserva).
- **Anti-passback:** Bloqueio inteligente de entrada se o veículo já estiver "dentro" do pátio.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- NPM ou Yarn

### Instalação
1. Clone o repositório.
2. Acesse a pasta do frontend:
   ```bash
   cd frontend
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

### Desenvolvimento
Inicie o servidor local com o comando:
```bash
npm run dev
```
O projeto estará disponível em `http://localhost:5173`.

### Build para Produção (Cloudflare Pages)
Para gerar a pasta de distribuição otimizada:
```bash
npm run build
```
O conteúdo será gerado na pasta `dist/`.

---

## 📄 Estrutura de Pastas
```text
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis (Layout, UI)
│   ├── pages/          # Páginas principais (Dashboard, Gates, Auth)
│   ├── store/          # Contextos globais (Autenticação, Módulos)
│   ├── services/       # Integração com APIs e WebSockets
│   ├── hooks/          # Hooks customizados
│   └── assets/         # Imagens e estilos globais
├── public/             # Arquivos estáticos
└── vite.config.ts      # Configurações do build
```

---

## 👤 Autor
**Danyllo Jonathas Cunha Pereira**  
Data: 08/03/2026
