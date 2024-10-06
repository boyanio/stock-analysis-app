FROM node:22.9.0-alpine3.20 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --no-audit

COPY tsconfig.json ./
COPY src ./src
COPY public ./public
COPY server ./server
RUN npm run build

FROM node:22.9.0-alpine3.20

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production --no-audit

COPY --from=build /usr/src/app/build ./build
COPY server ./server
COPY tsconfig.json ./

EXPOSE 8080

CMD ["npm", "run", "start:server:production"]
