# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy prisma directory (including schema.prisma)
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy the current directory contents into the container
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Create directories for logs and uploads
RUN mkdir -p /app/logs \
    && mkdir -p /app/public/uploads/users \
    && mkdir -p /app/public/uploads/posts \
    && mkdir -p /app/public/uploads/bird-icons

# Set permissions for the logs and uploads directories
RUN chmod -R 755 /app/logs /app/public/uploads

CMD ["npm", "start"]