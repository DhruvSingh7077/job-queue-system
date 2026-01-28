FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Clean install without using cache
RUN npm cache clean --force && npm install --no-package-lock

# Copy source code
COPY src ./src

CMD ["npm", "start"]