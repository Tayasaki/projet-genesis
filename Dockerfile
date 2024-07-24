FROM node:18-alpine AS base

WORKDIR /app

COPY package.json ./

RUN npm i -g pnpm

RUN pnpm i

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]