# Como contribuir

Este repositório usa **GitHub Flow** com Pull Requests. Commits diretos em `main` devem ser evitados.

## Branches

| Prefixo | Uso |
| --- | --- |
| `feat/` | nova funcionalidade |
| `fix/` | correção de bug |
| `docs/` | documentação |
| `ci/` | pipeline e Docker |

Exemplo: `feat/persistencia-sqlite`.

## Commits (Conventional Commits)

```
feat: persiste campanha no SQLite
fix: corrige healthcheck da API
docs: atualiza README com Docker
ci: adiciona workflow de testes
```

## Fluxo

1. `git checkout -b feat/minha-mudanca`
2. Implemente e rode `npm test` e `npm run build`
3. `git push -u origin HEAD`
4. Abra um Pull Request usando o template
5. Espere o GitHub Actions (`CI`) passar
6. Merge via PR (não push direto em `main`)

## Proteção de `main` (GitHub)

Em **Settings → Branches → Add branch protection rule** para `main`:

- Require a pull request before merging
- Require status checks to pass (`test-and-build`)
- Do not allow bypassing the above settings (quando disponível)

Isso não vai no código: precisa ser ativado na interface do repositório.
