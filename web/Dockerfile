FROM node:18-slim AS build
#Cria um estágio chamado build
#Serve apenas para:
#instalar deps
#rodar npm run build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
#Gera arquivos estáticos:
#dist/
#HTML, CSS, JS puro

FROM nginx:1.25-alpine
#Imagem ultra leve
#Servidor HTTP estático
#Ideal para front-end SPA

COPY --from=build /app/dist /usr/share/nginx/html
#Copia somente o resultado do build
#Ignora:
#node_modules
#Node
#código fonte

# SPA fallback: envia rotas para index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
#daemon off:
#mantém o processo no foreground
#container não morre