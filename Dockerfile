FROM node:18-alpine3.15

# create project directory
WORKDIR /usr/src/rota-api

COPY . .

RUN NODE_ENV=development npm install

EXPOSE $app_port
CMD ["npm", "run", "start:dev"]