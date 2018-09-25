FROM node:8.12

WORKDIR /app

ENV NODE_ENV=production

ADD ./public/allen/ ./public/allen/

ADD ./package.json .

ADD ./yarn.lock .

RUN yarn install

ADD ./public/*.* ./public/

ADD ./server/*.js ./server/

CMD ["node", "server/app.js"]

EXPOSE  9683
