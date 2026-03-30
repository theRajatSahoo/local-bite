FROM node:18-alpine

WORKDIR /app

# Copy only dependency files first (for caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy application code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
