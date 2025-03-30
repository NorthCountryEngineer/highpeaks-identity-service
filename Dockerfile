# Use Node.js LTS Alpine base image for a small footprint
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --only=prod

# Copy application code
COPY index.js ./

# Expose port 80 and run the app
EXPOSE 80
CMD ["npm", "start"]