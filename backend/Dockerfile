FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy application code
COPY . .

# Create uploads and logs directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]

