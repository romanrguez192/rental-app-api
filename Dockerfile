FROM node:16.14.2-alpine3.14

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5000

USER node

CMD ["node", "src/index.js"]
