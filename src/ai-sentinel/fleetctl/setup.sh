#!/bin/sh
set -eu

echo "El perfil 'setup' de fleetctl aun no tiene una implementacion automatizada en este repositorio."
echo "Variables detectadas:"
echo "  FLEET_ADDRESS=${FLEET_ADDRESS:-}"
echo "  FLEET_ENROLL_URL=${FLEET_ENROLL_URL:-}"
echo "  INSTALLER_NAME=${INSTALLER_NAME:-}"
echo
echo "Completa este contenedor con la logica de inicializacion y generacion de instaladores antes de usar el perfil setup."
exit 1
