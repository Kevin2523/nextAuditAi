# Guia de contribucion - NextAudit AI

Gracias por contribuir a NextAudit AI.

## Flujo de ramas

| Rama | Proposito |
| --- | --- |
| `main` | Base estable minima |
| `develop` | Desarrollo activo e integracion |
| `docs` | Actualizaciones exclusivas de documentacion |

## Reglas

- Crea ramas de trabajo (`feature/`, `fix/`, etc.) desde `develop`.
- Abre PR hacia `develop` para cambios de codigo.
- Usa PR hacia `main` solo para ajustes de linea base estable.
- Usa PR hacia `docs` solo para cambios de documentacion.

## Convenciones de nombres

Prefijos recomendados de rama:

- `feature/`
- `fix/`
- `infra/`
- `docs/`

## Recomendaciones de commits

- Mantener commits pequenos, atomicos y con alcance claro.
- Preferir estilo de commits convencionales (`feat:`, `fix:`, `docs:`, `chore:`).
- No subir secretos ni llaves privadas.

## Checklist antes del PR

- El codigo o la documentacion estan alineados con el proposito de la rama destino.
- No hay secretos hardcodeados en variables o archivos.
- Los cambios de compose y automatizacion fueron validados de forma basica.
- README y `plans/` se actualizaron cuando hubo cambios de arquitectura o flujo.