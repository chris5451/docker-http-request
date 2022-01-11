FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js ./index.js

RUN npm install

CMD ["npm", "start"]