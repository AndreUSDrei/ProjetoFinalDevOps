# Valorant Manager — Como rodar o projeto

**Valorant Manager (VCT Transfer & Tactical Simulator)** é um web app de gestão de eSports (estilo Football Manager) para o cenário competitivo de VALORANT. Frontend puro (sem backend e sem banco de dados), construído com React + Vite + Tailwind CSS.

---

## 1. Pré-requisitos

| Ferramenta | Versão recomendada | Verificar |
|---|---|---|
| Node.js | 18 ou superior (LTS recomendado) | `node -v` |
| npm | 9 ou superior (vem com o Node) | `npm -v` |
| Git (opcional) | qualquer | `git --version` |

Download do Node.js: https://nodejs.org

> O projeto foi pensado para Windows 10 + PowerShell + VS Code, mas roda igualmente em Linux e macOS.

---

## 2. Dependências do projeto

### Dependências de produção (`dependencies`)

| Pacote | Versão | Para que serve |
|---|---|---|
| `react` | ^18.3.1 | Biblioteca de interface |
| `react-dom` | ^18.3.1 | Renderização do React no navegador |
| `lucide-react` | ^0.540.0 | Biblioteca de ícones |

### Dependências de desenvolvimento (`devDependencies`)

| Pacote | Versão | Para que serve |
|---|---|---|
| `vite` | ^5.4.10 | Bundler e servidor de desenvolvimento |
| `@vitejs/plugin-react` | ^4.3.4 | Plugin do React para o Vite |
| `tailwindcss` | ^3.4.17 | Framework de CSS utilitário |
| `postcss` | ^8.4.49 | Processador de CSS (exigido pelo Tailwind) |
| `autoprefixer` | ^10.4.20 | Adiciona prefixos de navegador ao CSS |

Todas são instaladas automaticamente com `npm install` (versões exatas travadas no `package-lock.json`).

---

## 3. Passo a passo para rodar

### 3.1 Extrair o projeto
Descompacte o `ProjetoFinalDevOps.zip` e entre na pasta:

```bash
cd ProjetoFinalDevOps
```

### 3.2 Instalar as dependências
```bash
npm install
```
Isso cria a pasta `node_modules/`. Use `npm ci` se quiser uma instalação idêntica ao `package-lock.json`.

### 3.3 Iniciar em modo desenvolvimento
```bash
npm run dev
```
Abra no navegador: **http://localhost:5173**

O servidor também fica exposto na rede local (`--host` / `0.0.0.0`), então outros dispositivos da mesma rede podem acessar pelo IP da sua máquina, ex.: `http://192.168.0.10:5173`.

### 3.4 Gerar build de produção
```bash
npm run build
```
Os arquivos otimizados são gerados na pasta `dist/`.

### 3.5 Testar o build de produção localmente
```bash
npm run preview
```

---

## 4. Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot reload (porta 5173) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |

---

## 5. Estrutura do projeto

```
ProjetoFinalDevOps/
├── index.html                # Entrada HTML
├── package.json              # Dependências e scripts
├── vite.config.js            # Configuração do Vite (porta 5173, host 0.0.0.0)
├── tailwind.config.js        # Configuração do Tailwind
├── postcss.config.js         # Configuração do PostCSS
└── src/
    ├── main.jsx              # Ponto de entrada React
    ├── App.jsx               # Componente raiz / navegação
    ├── index.css             # Estilos globais + Tailwind
    ├── context/GameContext.jsx   # Estado global do jogo
    ├── pages/                # SelectOrg, SetupManager, Dashboard, TransferMarket
    ├── components/           # ui/, layout/, player/
    ├── data/                 # players.json, teams.json, organizations.js
    └── utils/                # calculators.js, formatters.js
```

---

## 6. Solução de problemas

| Problema | Solução |
|---|---|
| `npm` não é reconhecido | Instale o Node.js e reabra o terminal |
| Erro de versão do Node / sintaxe | Atualize para Node 18+ |
| Porta 5173 em uso | Feche o outro processo ou rode `npm run dev -- --port 3000` |
| Erros estranhos após instalar | Apague `node_modules` e rode `npm install` novamente |
| PowerShell bloqueia scripts (`running scripts is disabled`) | Execute `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Não abre de outro dispositivo | Libere a porta 5173 no firewall do Windows |

---

## 7. Resumo rápido

```bash
cd ProjetoFinalDevOps
npm install
npm run dev
# abrir http://localhost:5173
```
