FROM node:22-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build client distribution
RUN npm run build

# Default environment configuration
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Launch server with tsx
CMD ["npm", "start"]
