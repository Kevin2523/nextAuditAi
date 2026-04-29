FROM ollama/ollama:latest

EXPOSE 11434

COPY start.sh /start.sh

# Quita CRLF si viene de Windows y asegura permisos
RUN sed -i 's/\r$//' /start.sh && chmod +x /start.sh

ENTRYPOINT ["/bin/sh", "/start.sh"]