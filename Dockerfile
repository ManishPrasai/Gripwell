FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS build
ARG APP=customer
COPY . .
RUN npm ci
RUN npm run build --workspace=apps/${APP}

FROM base AS runner
ARG APP=customer
ENV NODE_ENV=production
COPY --from=build /app ./
WORKDIR /app/apps/${APP}

EXPOSE 3000

CMD ["npm", "start"]
