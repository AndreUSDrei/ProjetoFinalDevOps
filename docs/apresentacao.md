# Valorant Manager — Apresentação DevOps

Slides para demonstração. Cada `---` é um slide (colar no PowerPoint, Google Slides ou Marp).

---

## 1. O produto

**Valorant Manager** é um simulador de gestão de eSports (VCT): treinador, franquia, elenco, transferências e partida.

O jogo já existia no front (React + Vite). Esta entrega fecha a **rubrica DevOps**.

---

## 2. Problema que a rubrica apontou

| Área | Antes |
| --- | --- |
| API | inexistente |
| Persistência | só memória (F5 apagava o save) |
| Docker | nenhum |
| Testes | nenhum |
| CI/CD | zero workflows |
| Logs / health | nenhum |
| Env | sem `.env.example` |
| Git | só `main`, sem PRs |
| Demo | sem material de apresentação |

---

## 3. Arquitetura atual

```
Navegador  →  Nginx (front estático)
                 └─ /api e /health  →  Express
                                         └─ SQLite (volume)
```

- Front continua dono da simulação.
- API serve seed (jogadores/orgs), save da campanha e healthcheck.

---

## 4. Demo local (desenvolvimento)

```bash
npm install
npm --prefix server install
npm run dev:api
npm run dev
```

Abrir http://localhost:5173  
Health: http://localhost:3001/health

---

## 5. Demo com Docker (produção local)

```bash
docker compose up --build
```

- App: http://localhost:8080
- API: http://localhost:3001/health
- Estado do jogo sobrevive a reload e a `docker compose restart`

---

## 6. Persistência

- `PUT /api/saves/default` grava JSON da campanha no SQLite
- `GET /api/saves/default` restaura
- `localStorage` como fallback se a API estiver fora

---

## 7. Testes

```bash
npm test
```

- Unitários (Vitest): overall, import rule, `teamStrength`, simulação com seed
- Integração (Node test + supertest): `/health`, players, save/load

---

## 8. CI/CD

GitHub Actions (`.github/workflows/ci.yml`) em push/PR para `main`:

1. `npm ci` (front + API)
2. testes
3. `vite build`
4. `docker compose build`

---

## 9. Logs e monitoramento

- Logs JSON com **pino** + **pino-http** (cada request)
- `GET /health` → `{ status, database, uptime }`
- Healthcheck no Compose (`api` precisa estar `healthy` antes do `web`)

---

## 10. Segurança e env

- `.env` no `.gitignore`
- `.env.example` na raiz e em `server/`
- Variáveis: `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`, `VITE_API_URL`, `LOG_LEVEL`
- Container da API roda como usuário `node`

---

## 11. Git / organização

- `CONTRIBUTING.md` + template de PR
- Conventional Commits (`feat:`, `fix:`, `ci:`)
- Proteção de `main`: Settings → Branches (PR + check `test-and-build`)

---

## 12. Evidências rápidas para a banca

1. Código da API em `server/`
2. `docker compose ps` com health
3. Reload do browser mantém o save
4. Aba Actions no GitHub verde
5. Este arquivo + README atualizado
