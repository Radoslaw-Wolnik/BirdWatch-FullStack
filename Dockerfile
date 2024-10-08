# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the current directory contents into the container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Create a directory for logs
RUN mkdir -p /app/logs

# Create uploads directory
RUN mkdir -p public/uploads

# Set permissions for the logs directory
RUN chmod 777 /app/logs

CMD ["npm", "start"]