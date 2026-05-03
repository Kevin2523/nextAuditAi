FROM alpine:3.20

COPY setup.sh /setup.sh

RUN sed -i 's/\r$//' /setup.sh \
    && chmod +x /setup.sh

ENTRYPOINT ["/bin/sh", "/setup.sh"]
