FROM node:18-alpine  AS build

WORKDIR /nextapp
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
