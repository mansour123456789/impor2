# Build & Serve React Application avec node:20-alpine (déjà en cache local)
FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build

EXPOSE 80

# Serveur web haute performance intégré pour le bundle de production
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "80"]
