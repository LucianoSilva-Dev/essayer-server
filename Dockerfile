FROM node:20-alpine AS builder

ENV SERVER_PORT=3001

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npx copyfiles -u 1 "src/**/*.{json,hbs}" dist

FROM node:20-alpine AS deploy

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE $SERVER_PORT
CMD ["npm", "run", "start"]