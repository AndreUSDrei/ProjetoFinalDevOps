# Valorant Manager — Como rodar o projeto

**Valorant Manager (VCT Transfer & Tactical Simulator)** é um web app de gestão de eSports (estilo Football Manager) para o cenário competitivo de VALORANT. O front-end é feito em React + Vite + Tailwind, e a API em Node (Express) com persistência em SQLite, logs, healthcheck, Docker e pipelines de CI/CD.

Repositório: https://github.com/AndreUSDrei/ProjetoFinalDevOps

## Sumário

1. [Sobre o projeto](#1-sobre-o-projeto)
2. [Tecnologias](#2-tecnologias)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Arquitetura](#4-arquitetura)
5. [API e banco de dados](#5-api-e-banco-de-dados)
6. [Variáveis de ambiente](#6-variáveis-de-ambiente)
7. [Instalação e execução (desenvolvimento)](#7-instalação-e-execução-desenvolvimento)
8. [Docker](#8-docker)
9. [Testes](#9-testes)
10. [CI/CD e deploy](#10-cicd-e-deploy)
11. [Scripts](#11-scripts)
12. [Estrutura do projeto](#12-estrutura-do-projeto)
13. [Logs e monitoramento](#13-logs-e-monitoramento)
14. [Solução de problemas](#14-solução-de-problemas)
15. [Documentação adicional](#15-documentação-adicional)
16. [Resumo rápido](#16-resumo-rápido)

---

## 1. Sobre o projeto

O projeto é um jogo de gestão de eSports no estilo Football Manager, com foco no cenário competitivo de VALORANT. O front-end cuida da interface, das regras de jogo e da simulação das partidas. A API fornece os dados iniciais de jogadores e organizações e guarda o save da campanha.

Além do jogo em si, o projeto aplica práticas de DevOps: testes automatizados, contêineres com Docker, healthcheck, logs estruturados e pipelines de CI/CD no GitHub Actions.

Se a API estiver fora do ar, o front grava o progresso no `localStorage` e continua jogável.

## 2. Tecnologias

| Parte | Tecnologia |
| --- | --- |
| Front-end | React, Vite e Tailwind |
| API | Node.js + Express |
| Banco de dados | SQLite |
| Logs | pino (logs em JSON) |
| Testes | Vitest (front) e Supertest (API) |
| Contêineres | Docker e Docker Compose (Nginx serve o front) |
| CI/CD | GitHub Actions |

## 3. Pré-requisitos

| Ferramenta | Versão recomendada | Verificar |
| --- | --- | --- |
| Node.js | 22.5 ou superior (22 LTS recomendado) | `node -v` |
| npm | 9 ou superior | `npm -v` |
| Docker Desktop (opcional) | atual | `docker compose version` |
| Git (opcional) | qualquer | `git --version` |

Download do Node.js: https://nodejs.org

> O projeto foi pensado para Windows 10 + PowerShell + VS Code, mas roda igualmente em Linux e macOS.

## 4. Arquitetura

```text
Desenvolvimento:
Navegador → Vite (porta 5173)
              /api  /health → Express (porta 3001)
                                SQLite (arquivo local)

Produção:
Navegador → Vercel (frontend React)
              HTTPS/CORS → Render (API Docker)
                              SQLite (disco efêmero no plano free)

GitHub Actions → testes, build, GHCR e verificação pública do deploy
```

| Serviço | Papel |
| --- | --- |
| Front (`src/`) | UI, regras de jogo, simulação |
| API (`server/`) | seed de jogadores/orgs, save da campanha, logs, `/health` |
| SQLite | persistência do save + catálogo |

Endereços públicos:

- Aplicação: https://projetofinaldevops.vercel.app
- API: https://valorant-manager-api.onrender.com
- Healthcheck: https://valorant-manager-api.onrender.com/health

## 5. API e banco de dados

### API

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/health` | Status, uptime e ping no banco |
| GET | `/api/players` | Lista de jogadores (seed) |
| GET | `/api/organizations` | Lista de organizações (seed) |
| GET | `/api/saves/:slot` | Carrega a campanha do slot (padrão: `default`) |
| PUT | `/api/saves/:slot` | Salva a campanha no slot |

### Banco de dados

O projeto usa **SQLite**, que guarda o save da campanha e o catálogo de jogadores e organizações. O banco é um único arquivo, sem precisar de servidor separado.

- **Local do arquivo:** definido por `DATABASE_PATH` (padrão: `./data/app.db`).
- **Dados iniciais (seed):** lidos da pasta definida em `SEED_DIR` (padrão: `../src/data`).
- **No Docker:** o arquivo fica no volume `sqlite-data`, então o save continua depois de `docker compose down` (desde que não use `-v`).
- **No Render free:** o disco é efêmero; saves feitos na nuvem podem ser perdidos em reinícios ou redeploys. Para persistência permanente, use um banco gerenciado e migre o SQLite.
- **Requisito:** a API usa o módulo `node:sqlite`, disponível a partir do Node 22.5.

## 6. Variáveis de ambiente

Copie os arquivos de exemplo (nunca faça commit de um `.env` com segredos):

```powershell
copy .env.example .env
copy server\.env.example server\.env
```

| Variável | Onde | Para que serve | Padrão |
| --- | --- | --- | --- |
| `VITE_API_URL` | front | Endereço da API usado pelo front | vazio local; URL do Render automaticamente na Vercel |
| `PORT` | API | Porta em que a API sobe | `3001` |
| `DATABASE_PATH` | API | Caminho do arquivo SQLite | `./data/app.db` |
| `SEED_DIR` | API | Pasta com os dados iniciais (seed) | `../src/data` |
| `CORS_ORIGIN` | API | Origem permitida pelo CORS | locais em desenvolvimento; origem da Vercel no Render |
| `LOG_LEVEL` | API | Nível de detalhe dos logs | `info` |
| `NODE_ENV` | API | Ambiente de execução | `development` |
| `RENDER_GIT_COMMIT` | Render | Commit da implantação, usado no `/health` quando `COMMIT_SHA` está vazio | fornecida pelo Render |

Na Vercel, o build detecta `VERCEL=1` e compila o frontend com `https://valorant-manager-api.onrender.com`. Definir `VITE_API_URL` sobrescreve esse endereço. Fora da Vercel, o valor vazio preserva o proxy do Vite e o roteamento relativo do Nginx.

## 7. Instalação e execução (desenvolvimento)

### 7.1 Instalar dependências

```bash
npm install
npm --prefix server install
```

### 7.2 Subir API e front

Em um terminal:

```bash
npm run dev:api
```

Em outro:

```bash
npm run dev
```

Abra http://localhost:5173. Healthcheck: http://localhost:3001/health.

O Vite faz proxy de `/api` e `/health` para a porta 3001.

### 7.3 Build de produção do front

```bash
npm run build
npm run preview
```

## 8. Docker

```bash
docker compose up --build
```

- App: http://localhost:8080
- Healthcheck pelo front: http://localhost:8080/health

A API não publica a porta 3001 no host; ela fica acessível apenas na rede interna do Compose. O serviço `web` só sobe depois do healthcheck da `api`. O arquivo SQLite fica no volume `sqlite-data`.

Para parar: `docker compose down`. Para manter o banco, não use `-v`.

### Rodar as imagens publicadas (GHCR)

```bash
docker run -d -p 3001:3001 --name api ghcr.io/andreusdrei/projetofinaldevops/api:latest
docker run -d -p 8080:80 --name web ghcr.io/andreusdrei/projetofinaldevops/web:latest
```

## 9. Testes

```bash
npm test
```

| Comando | O que cobre |
| --- | --- |
| `npm run test:front` | Vitest — fórmulas e motor de partida |
| `npm run test:api` | Supertest — `/health`, seed, save/load e commit do Render |
| `npm run verify:deploy` | Smoke público — commit, healthcheck, seed e URL da API no bundle da Vercel |

## 10. CI/CD e deploy

O projeto tem duas pipelines no GitHub Actions.

**CI** (`.github/workflows/ci.yml`) — disparada a cada push ou Pull Request para `main`:

1. Instala as dependências (front e API)
2. Executa os testes unitários (Vitest) e de integração (Supertest)
3. Executa o build de produção do front (`vite build`)
4. Valida a construção das imagens Docker (`docker compose build`)

**CD** (`.github/workflows/cd.yml`) — disparada em pushes para `main` e em novas tags de versão (`v*`):

1. Executa a suíte de testes automatizados
2. Constrói e publica as imagens da API e do front no GitHub Container Registry (GHCR), com tags de versão (`v1.0.0`), hash do commit (`sha-...`) e `latest`
3. Executa um smoke test com `curl /health`, para validar que a imagem publicada sobe, conecta ao SQLite e expõe a versão e o commit ativos

**Deploy contínuo:** a `main` alimenta automaticamente a API no Render e o frontend na Vercel. O `render.yaml` define `autoDeployTrigger: commit`, healthcheck e CORS restrito à origem pública da Vercel. O build da Vercel detecta `VERCEL=1` e incorpora a URL pública da API.

Depois da publicação das imagens, o job `verify-public-deploy` aguarda até 10 minutos e valida:

1. `/health` retorna `200`, SQLite ativo e o commit esperado;
2. `/api/players` retorna o seed;
3. a página da Vercel contém o meta `app-commit` esperado;
4. os bundles JavaScript publicados apontam para a URL da API.

Para executar a mesma verificação localmente:

```bash
npm run verify:deploy
```

As URLs podem ser sobrescritas pelas variáveis `API_URL` e `WEB_URL`; `EXPECTED_COMMIT` exige um commit específico. No GitHub Actions, as variables opcionais `RENDER_API_URL` e `VERCEL_APP_URL` permitem trocar os endereços sem editar o workflow. Não é necessário token de deploy: Render e Vercel usam suas integrações Git nativas.

Como contribuir, padrão de commits e proteção da `main`: veja o [CONTRIBUTING.md](CONTRIBUTING.md).

## 11. Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Front Vite (porta 5173) |
| `npm run dev:api` | API Express (porta 3001) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` |
| `npm test` | Testes front + API |
| `npm run verify:deploy` | Valida API Render e frontend Vercel publicados |

## 12. Estrutura do projeto

```text
ProjetoFinalDevOps/
├── .github/workflows/         # pipelines (ci.yml e cd.yml)
├── docs/                      # documentação (apresentacao.md, documentacao.md)
├── server/                    # API Express + SQLite
│   ├── Dockerfile
│   └── src/
├── src/                       # React (páginas, GameContext, motor)
├── Dockerfile                 # Front (Nginx)
├── docker-compose.yml
├── nginx.conf
├── scripts/                  # verificação do deploy público
├── CONTRIBUTING.md
└── README.md
```

## 13. Logs e monitoramento

A API emite logs em JSON (pino) por request. Em desenvolvimento, eles aparecem no terminal do `npm run dev:api`.

Para checar a saúde da API:

```bash
curl http://localhost:3001/health
curl https://valorant-manager-api.onrender.com/health
```

Resposta esperada: `"status":"ok"` e `"database":"up"`. Em produção, `commit` identifica a versão implantada; `startedAt` ajuda a confirmar que o serviço reiniciou após o deploy.

## 14. Solução de problemas

| Problema | Solução |
| --- | --- |
| `npm` não é reconhecido | Instale o Node.js e reabra o terminal |
| Porta 5173 ou 3001 em uso | Feche o outro processo ou mude `PORT` / `--port` |
| Front sem save após F5 | Confirme se a API está no ar (`/health`) |
| SQLite experimental no Node 22 | A API usa `node:sqlite` (Node 22.5+). No 22, o Compose já define `NODE_OPTIONS=--experimental-sqlite` |
| PowerShell bloqueia scripts | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

## 15. Documentação adicional

- [docs/documentacao.md](docs/documentacao.md): objetivo, escopo, requisitos, tecnologias e arquitetura
- [docs/apresentacao.md](docs/apresentacao.md): slides da demonstração
- [CONTRIBUTING.md](CONTRIBUTING.md): como contribuir

## 16. Resumo rápido

```bash
npm install
npm --prefix server install
npm run dev:api
npm run dev
# http://localhost:5173
```

Demonstração em contêineres:

```bash
docker compose up --build
# http://localhost:8080
```

Produção:

- Vercel: https://projetofinaldevops.vercel.app
- API Render: https://valorant-manager-api.onrender.com
- Validação: `npm run verify:deploy`
