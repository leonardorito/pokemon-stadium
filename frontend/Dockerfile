FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000"]