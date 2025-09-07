
# Use a imagem oficial do Node.js como base
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Compila o código TypeScript para JavaScript
RUN npm run build

# Expõe a porta em que a aplicação será executada
EXPOSE 3000

# Define o comando para iniciar a aplicação
CMD ["npm", "start"]
