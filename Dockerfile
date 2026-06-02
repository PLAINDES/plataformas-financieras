FROM oven/bun:alpine AS base
WORKDIR /app
COPY package*.json ./
RUN bun install --frozen-lockfile

FROM base AS development
COPY . .
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
RUN bun run build

FROM nginx:1.27-alpine AS production
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
