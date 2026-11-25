# Documentação — Valorant Manager (VCT Transfer & Tactical Simulator)

## 1. Objetivo

Desenvolver um web app de gestão de eSports, no estilo Football Manager, para o cenário competitivo de VALORANT, e usar o projeto para aplicar na prática um fluxo DevOps completo: testes automatizados, contêineres, healthcheck, logs e pipelines de CI/CD.

## 2. Problema que o projeto resolve

O projeto oferece uma experiência de gestão (montar e administrar um time, tomar decisões e simular partidas) para quem gosta do cenário competitivo de VALORANT. Do ponto de vista de DevOps, ele resolve o problema de ter uma aplicação que roda de forma diferente em cada máquina e que depende de passos manuais: com Docker, testes automáticos e pipelines, qualquer pessoa consegue rodar, validar e publicar o projeto sempre do mesmo jeito.

## 3. Escopo

**Dentro do escopo**

- Front-end com interface, regras de jogo e simulação de partidas.
- API com dados iniciais (jogadores e organizações) e save da campanha.
- Persistência em SQLite, com fallback para `localStorage` quando a API está fora.
- Logs estruturados e endpoint de healthcheck.
- Execução em contêineres com Docker Compose.
- Testes automatizados e pipelines de CI/CD no GitHub Actions.


## 4. Requisitos funcionais

| Código | Requisito |
| --- | --- |
| RF01 | O sistema deve disponibilizar o catálogo de jogadores e de organizações (seed) pela API. |
| RF02 | O sistema deve permitir salvar e carregar a campanha em um slot (padrão: `default`). |
| RF03 | O sistema deve simular partidas a partir das regras e fórmulas do jogo (motor de partida). |
| RF04 | O front deve continuar funcionando e guardar o progresso no `localStorage` caso a API esteja fora do ar. |
| RF05 | A API deve expor um endpoint de saúde (`/health`) com status, uptime e ping no banco. |


## 5. Requisitos não funcionais

| Código | Requisito |
| --- | --- |
| RNF01 | **Portabilidade:** rodar em Windows, Linux e macOS e também em contêineres Docker. |
| RNF02 | **Testabilidade:** ter testes automatizados para o front (Vitest) e para a API (Supertest). |
| RNF03 | **Automação:** validar o código a cada push ou Pull Request para `main` por meio de CI. |
| RNF04 | **Entrega contínua:** publicar as imagens no GitHub Container Registry com tags de versão, de commit e `latest`. |
| RNF05 | **Observabilidade:** gerar logs JSON por request e disponibilizar o healthcheck. |
| RNF06 | **Resiliência:** manter o jogo utilizável mesmo sem a API. |
| RNF07 | **Segurança:** não versionar arquivos `.env` com segredos; usar `.env.example` como modelo e restringir a origem do CORS. |

## 6. Tecnologias

| Parte | Tecnologia |
| --- | --- |
| Front-end | React, Vite e Tailwind |
| API | Node.js + Express |
| Banco de dados | SQLite (`node:sqlite`, Node 22.5+) |
| Logs | pino |
| Testes | Vitest e Supertest |
| Contêineres | Docker, Docker Compose e Nginx |
| CI/CD | GitHub Actions e GitHub Container Registry (GHCR) |

## 7. Arquitetura

```
Navegador → Vite (dev) ou Nginx (Docker)
              /api  /health → Express (porta 3001)
                                SQLite (arquivo em volume)
```

| Componente | Responsabilidade |
| --- | --- |
| Front (`src/`) | Interface, regras de jogo e simulação |
| API (`server/`) | Seed de jogadores e organizações, save da campanha, logs e `/health` |
| SQLite | Persistência do save e do catálogo |
| Nginx | Serve o front e encaminha `/api` e `/health` para a API (no Docker) |
| Docker Compose | Sobe `web` e `api`; o `web` só inicia depois do healthcheck da `api` |

**Banco de dados:** SQLite, em um único arquivo (`DATABASE_PATH`, padrão `./data/app.db`), que guarda o save da campanha e o catálogo. Os dados iniciais vêm da pasta `SEED_DIR`. No Docker, o arquivo fica no volume `sqlite-data`.

**Fluxo principal:** o usuário usa o front no navegador; o front consulta a API para carregar os dados e salvar a campanha; a API grava no SQLite. Se a API estiver fora, o front usa o `localStorage`.

## 8. Processo DevOps

| Etapa | Como é no projeto |
| --- | --- |
| Desenvolvimento | `npm run dev:api` e `npm run dev` |
| Git | Repositório no GitHub, com regras de commit e proteção da `main` descritas no `CONTRIBUTING.md` |
| Pull Request | Revisão e integração das mudanças na `main` |
| Build | `npm run build` (front) e `docker compose build` (imagens) |
| Testes | `npm test` (Vitest + Supertest) |
| Pipeline CI | `.github/workflows/ci.yml`: instala, testa, faz build e valida as imagens |
| Pipeline CD | `.github/workflows/cd.yml`: testa, publica as imagens no GHCR e faz smoke test em `/health` |
| Deploy | Imagens publicadas no GHCR; demonstração local com `docker compose up --build` |
