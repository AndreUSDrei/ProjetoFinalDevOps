# Valorant Manager — Como rodar o projeto

**Valorant Manager (VCT Transfer & Tactical Simulator)** é um web app de gestão de eSports (estilo Football Manager) para o cenário competitivo de VALORANT. Front-end em React + Vite + Tailwind; API Node (Express) com persistência SQLite, logs, healthcheck, Docker e CI.

Repositório: https://github.com/AndreUSDrei/ProjetoFinalDevOps

---

## 1. Pré-requisitos

| Ferramenta | Versão recomendada | Verificar |
|---|---|---|
| Node.js | 22.5 ou superior (22 LTS recomendado) | `node -v` |
| npm | 9 ou superior | `npm -v` |
| Docker Desktop (opcional) | atual | `docker compose version` |
| Git (opcional) | qualquer | `git --version` |

Download do Node.js: https://nodejs.org

> O projeto foi pensado para Windows 10 + PowerShell + VS Code, mas roda igualmente em Linux e macOS.

---

## 2. Arquitetura

```
Navegador → Vite (dev) ou Nginx (Docker)
              /api  /health → Express (porta 3001)
                                SQLite (arquivo em volume)
```

| Serviço | Papel |
|---|---|
| Front (`src/`) | UI, regras de jogo, simulação |
| API (`server/`) | seed de jogadores/orgs, save da campanha, logs, `/health` |
| SQLite | persistência do save + catálogo |

Endpoints:

- `GET /health` — status, uptime, ping no banco
- `GET /api/players` / `GET /api/organizations` — seed
- `GET` / `PUT /api/saves/:slot` — campanha (slot `default`)

Se a API estiver fora, o front grava em `localStorage` e continua jogável.

---

## 3. Variáveis de ambiente

Copie os exemplos (nunca commite `.env` com segredos):

```bash
copy .env.example .env
copy server\.env.example server\.env
```

| Variável | Onde | Padrão |
|---|---|---|
| `VITE_API_URL` | front | vazio (usa `/api` via proxy ou Nginx) |
| `PORT` | API | `3001` |
| `DATABASE_PATH` | API | `./data/app.db` |
| `SEED_DIR` | API | `../src/data` |
| `CORS_ORIGIN` | API | `http://localhost:5173` |
| `LOG_LEVEL` | API | `info` |
| `NODE_ENV` | API | `development` |

---

## 4. Passo a passo (desenvolvimento)

### 4.1 Instalar dependências

```bash
npm install
npm --prefix server install
```

### 4.2 Subir API e front

Em um terminal:

```bash
npm run dev:api
```

Em outro:

```bash
npm run dev
```

Abra **http://localhost:5173**. Healthcheck: **http://localhost:3001/health**.

O Vite faz proxy de `/api` e `/health` para a porta 3001.

### 4.3 Build de produção do front

```bash
npm run build
npm run preview
```

---

## 5. Docker

```bash
docker compose up --build
```

- App: **http://localhost:8080**
- API direta: **http://localhost:3001/health**

O serviço `web` só sobe depois do healthcheck da `api`. O arquivo SQLite fica no volume `sqlite-data`.

Parar: `docker compose down`. Manter o banco: não use `-v`.

---

## 6. Testes

```bash
npm test
```

| Comando | O que cobre |
|---|---|
| `npm run test:front` | Vitest — fórmulas e motor de partida |
| `npm run test:api` | Supertest — `/health`, seed, save/load |

---

## 7. CI/CD

Push ou Pull Request para `main` dispara `.github/workflows/ci.yml`:

1. Instala dependências
2. Roda testes
3. Faz `vite build`
4. Faz `docker compose build`

Não há publish em registry: o “deploy” de demonstração é o `docker compose up`.

Como contribuir, padrão de commits e proteção de `main`: veja [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 8. Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Front Vite (porta 5173) |
| `npm run dev:api` | API Express (porta 3001) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` |
| `npm test` | Testes front + API |

---

## 9. Estrutura

```
ProjetoFinalDevOps/
├── Dockerfile                 # Front (Nginx)
├── docker-compose.yml
├── nginx.conf
├── .github/workflows/ci.yml
├── docs/apresentacao.md       # Slides da demonstração
├── server/                    # API Express + SQLite
│   ├── Dockerfile
│   └── src/
└── src/                       # React (páginas, GameContext, motor)
```

---

## 10. Logs e monitoramento

A API emite logs JSON (pino) por request. Em desenvolvimento eles aparecem no terminal do `npm run dev:api`.

Health:

```bash
curl http://localhost:3001/health
```

Resposta esperada: `"status":"ok"` e `"database":"up"`.

---

## 11. Solução de problemas

| Problema | Solução |
|---|---|
| `npm` não é reconhecido | Instale o Node.js e reabra o terminal |
| Porta 5173 ou 3001 em uso | Feche o outro processo ou mude `PORT` / `--port` |
| Front sem save após F5 | Confirme se a API está no ar (`/health`) |
| SQLite experimental no Node 22 | A API usa `node:sqlite` (Node 22.5+). No 22, o Compose já define `NODE_OPTIONS=--experimental-sqlite` |
| PowerShell bloqueia scripts | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## 12. Resumo rápido

```bash
npm install
npm --prefix server install
npm run dev:api
npm run dev
# http://localhost:5173
```

Demonstração em containers:

```bash
docker compose up --build
# http://localhost:8080
```
