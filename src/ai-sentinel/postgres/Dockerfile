FROM ankane/pgvector:latest

COPY init-db.sh /docker-entrypoint-initdb.d/init-db.sh

RUN cd /docker-entrypoint-initdb.d \
    && sed -i 's/\r$//' init-db.sh \
    && chmod +x init-db.sh