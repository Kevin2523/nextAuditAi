# RFC-002 - Migration to NextAudit AI

| Field | Value |
| --- | --- |
| ID | RFC-002 |
| Title | Migration from ai-compliance-sentinel to NextAudit AI |
| Status | Approved |
| Date | 2026-04-28 |
| Author | NextAudit AI Team |

## Summary

This RFC defines the repository migration and baseline cleanup for the new NextAudit AI SaaS identity.

## Scope

- Rebrand project references to NextAudit AI / nextaudit-ai.
- Keep `main` minimal and stable.
- Keep full implementation in `develop`.
- Keep documentation-focused work in `docs`.

## Branch Strategy

- `main`: stable base (`README.md`, `.gitignore`, base compose files).
- `develop`: active product code and infrastructure evolution.
- `docs`: technical documentation and manuals.

## Key Decisions

1. Remove outdated onboarding/evaluation files from `develop`.
2. Update planning docs to the SaaS roadmap context.
3. Keep Ollama as optional infrastructure, not core orchestration brain.

## Risks

- Legacy references may still appear in historical docs.
- Team members using old branch flow may need re-onboarding.

## Mitigations

- Enforce branch conventions in `CONTRIBUTING.md`.
- Record migration changes in `CHANGELOG.md`.

## Acceptance Criteria

- `develop` contains no obsolete onboarding/evaluation docs.
- `plans/` reflects the new product direction.
- Contribution and changelog docs match current workflow.