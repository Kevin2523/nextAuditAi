#!/bin/sh
set -e

if [ -z "$OLLAMA_MODELS" ]; then
  echo " ERROR: La variable OLLAMA_MODELS no está definida."
  echo " Debes definirla en el archivo .env o en docker-compose.yml"
  exit 1
fi

echo "Iniciando Ollama..."
ollama serve &

sleep 5

echo "Modelos a descargar: $OLLAMA_MODELS"

for model in $OLLAMA_MODELS; do
  echo "Descargando $model ..."
  ollama pull "$model"
done

wait
