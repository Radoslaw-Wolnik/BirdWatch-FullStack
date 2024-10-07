FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

# Create a directory for logs
RUN mkdir -p /app/logs

# Set permissions for the logs directory
RUN chmod 777 /app/logs

CMD ["npm", "start"]