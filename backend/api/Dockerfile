# FROM node:18-alpine

# WORKDIR /app

# # Copy package files
# COPY package.json ./

# # Clean install without using cache
# RUN npm cache clean --force && npm install --no-package-lock

# # Copy source code
# COPY src ./src

# CMD ["npm", "start"]
FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src ./src

# API listens on 3000
EXPOSE 3000

# Start API
CMD ["node", "src/index.js"]
