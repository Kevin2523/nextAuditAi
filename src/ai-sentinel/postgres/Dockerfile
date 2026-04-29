FROM ankane/pgvector:latest

#Copiar script de inicio configurado a la carpeta de ejecucion post build
COPY init-db.sh /docker-entrypoint-initdb.d/init-db.sh
#darle permisos de ejecucion
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh
