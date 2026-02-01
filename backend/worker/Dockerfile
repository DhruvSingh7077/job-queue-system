# FROM node:18-alpine

# WORKDIR /app

# COPY package.json package-lock.json* ./
# RUN npm install

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

# Start worker
CMD ["node", "src/worker.js"]
