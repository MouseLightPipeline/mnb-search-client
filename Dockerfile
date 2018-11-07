FROM node:8.12

WORKDIR /app

COPY dist .

COPY ./public/allen/ ./public/allen/

RUN yarn install --production=true

CMD ["./docker-entry.sh"]

EXPOSE 5000
