# Build stage
FROM node:19-bullseye-slim AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY ./app/package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy necessary files for the build
COPY ./app/tsconfig.json ./
COPY ./app/vite.config.js ./
COPY ./app/public ./public
COPY ./app/src ./src
COPY ./app/index.html ./

# Set environment variables
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Server stage
FROM node:19-bullseye-slim AS server

# Create app directory and set as working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY ./server/package*.json ./

# Install Node.js dependencies for server
RUN npm ci --only=production

# Copy built code from the build stage
COPY --from=build /app/dist ./dist
COPY ./server/src ./src

# Add user and set permissions
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Set environment variables
ENV PORT 3000
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE $PORT

# Start the server
CMD ["npm", "run", "start"]
