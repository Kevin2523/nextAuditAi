# Contributing - NextAudit AI

Thanks for contributing to NextAudit AI.

## Branch Workflow

| Branch | Purpose |
| --- | --- |
| `main` | Stable minimal base |
| `develop` | Active development and integration |
| `docs` | Documentation-only updates |

## Rules

- Start feature/fix branches from `develop`.
- Open PRs into `develop` for code changes.
- Use PRs into `main` only for stable baseline adjustments.
- Use PRs into `docs` only for documentation changes.

## Naming

Use branch prefixes:

- `feature/`
- `fix/`
- `infra/`
- `docs/`

## Commit Guidance

- Keep commits atomic and scoped.
- Prefer conventional commit style (`feat:`, `fix:`, `docs:`, `chore:`).
- Do not commit secrets or private keys.

## Pre-PR Checklist

- Code or docs are aligned with branch purpose.
- Environment values are not hardcoded with secrets.
- Compose and automation changes were sanity-checked.
- README and plans were updated when architecture changed.