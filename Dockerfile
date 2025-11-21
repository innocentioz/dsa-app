FROM node:20.17.0-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

FROM base as build

COPY . .

RUN npx prisma generate

RUN npm run build

FROM base AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
COPY --from=build /app/start.sh ./start.sh
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/start.sh ./start.sh
RUN chmod +x start.sh


EXPOSE 3000

CMD ["sh", "./start.sh"]
