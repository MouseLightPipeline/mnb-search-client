FROM node:8.16

WORKDIR /app

COPY dist .

RUN yarn install

CMD ["./docker-entry.sh"]

EXPOSE 5000
