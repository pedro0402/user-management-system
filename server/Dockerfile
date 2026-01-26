FROM node:18-slim
#aqui eu criei a imagem base
#node:18-slim = Node.js 18 + Debian enxuto
#ja vem com: node, npm e s.o mínimo

WORKDIR /app
#define o /app como ambiente de trabalho
#tudo que vier depois, acontece dentro dele (dentro do app). é a mesma coisa de fazer cd /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
#serve para instalar dependencias do s.o
#openssl é exigido por ferramentas como: prisma, conexoes ssl
#rm -rf /var/lib/apt/lists/* -> serve para reduzir o tamanho da imagem

COPY package*.json ./
#Isso é otimização de cache do Docker.
#Se seu código mudar, mas package.json não:
#Docker reaproveita a camada
#Não reinstala tudo de novo

RUN npm ci --omit=dev
#npm ci:
#instala exatamente o que está no package-lock.json
#mais rápido e previsível
#--omit=dev:
#não instala dependências de desenvolvimento
#ideal para produção

COPY . .
#copia todo o codigo da API (controllers, routes, prsma, etc)

RUN npx prisma generate && npm run build
#gera Prisma Client e compila TS para dist

ENV NODE_ENV=production
#ajusta variavel para modo prod

EXPOSE 3000
#nao abre porta. apenas serve para documentar que o container escuta nessa porta

CMD ["npm", "run", "start"]
#Comando que roda quando o container inicia