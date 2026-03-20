# MedPark - Gestão de Estacionamento Hospitalar (Firebase Edition)

![MedPark Banner](https://img.shields.io/badge/Status-Migration%20Complete-green)
![Firebase](https://img.shields.io/badge/Backend-Firebase%20%2F%20Cloud%20Functions-orange)
![React](https://img.shields.io/badge/Frontend-React%2019-blue)
![Vite](https://img.shields.io/badge/Build-Vite%207-purple)

**MedPark** é uma solução SaaS de alta performance para a gestão inteligente de pátios e estacionamentos hospitalares. O sistema foi migrado para o ecossistema **Firebase**, utilizando **Firestore** como banco de dados NoSQL e **Firebase Auth** para autenticação robusta e segura.

---

## 🚀 Tecnologias Utilizadas

### Frontend (Firebase Hosting)
- **Framework:** React 19 com TypeScript.
- **Build:** Vite 7.
- **SDK:** Firebase JS SDK v11+.
- **Estilização:** TailwindCSS v4 & Vanilla CSS.
- **Estado:** React Context API & Firebase Hooks.

### Backend & Database (Firebase)
- **Database:** Google Cloud Firestore (NoSQL, Real-time).
- **Authentication:** Firebase Authentication (E-mail/Senha).
- **Functions:** Firebase Cloud Functions Gen 2 (Node.js).
- **Hosting:** Firebase Hosting com SSL automático e CDN global.

---

## 📋 Especificações Funcionais

### 1. Níveis de Acesso
- **ADMIN:** Controle total, gestão de usuários e auditoria global no Firestore.
- **SUPERVISOR:** Gestão de operadores e cadastros de colaboradores/veículos.
- **OPERADOR:** Foco operacional (entrada/saída manual, reserva de vagas).

### 2. Regras de Negócio e Otimizações
- **Anti-passback:** Validação em tempo real para impedir entradas duplicadas.
- **Otimização Spark Plan:** 
  - **Offline Persistence**: Dados cacheados localmente no navegador.
  - **Memory Caching**: Cache inteligente para reduzir leituras no Firestore.
  - **Batch Queries**: Eliminação do problema N+1 em listagens pesadas.

---

## 📁 Estrutura do Projeto

```text
MedPark_Firebase/
├── frontend/           # Aplicação React Principal
│   ├── src/
│   │   ├── components/ # UI e Layout Modular
│   │   ├── pages/      # Portarias (GateA, GateE), Dashboards
│   │   ├── services/   # Integração Firestore (Vacancy, Employee, Vehicle)
│   │   └── lib/        # Configuração do Firebase SDK
├── backend/            # (Legado/Em Migração) API Hono original
├── .env                # Variáveis de ambiente (API Keys do Firebase)
└── firebase.json       # Configuração de Hosting e Functions
```

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js (v20 ou superior)
- Firebase CLI (`npm install -g firebase-tools`)

### Configuração e Desenvolvimento
1. **Instalação**:
   ```bash
   npm install
   ```
2. **Variáveis de Ambiente**:
   Crie um arquivo `.env` na pasta `frontend/` com suas chaves do Firebase:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   ```
3. **Execução Local**:
   ```bash
   cd frontend
   npm run dev
   ```

### Deploy
```bash
# Frontend
firebase deploy --only hosting
```

---

## 👤 Autor
**Danyllo Jonathas Cunha Pereira**  
*Atualizado em: 20/03/2026 - CI/CD Habilitado*
