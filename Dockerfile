# Build stage
FROM node:alpine AS build

RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*

# Set working directory for the build stage
WORKDIR /app

# Copy package.json and tsconfig.json for the app
COPY ./app/package*.json /app/tsconfig.json ./

# Install all Node.js dependencies (including devDependencies)
RUN npm ci

# Copy the application source code
COPY ./app/ ./

# Set environment variables
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Server stage
FROM node:slim AS server

# Set the working directory for the server stage
WORKDIR /app

# Copy package.json and package-lock.json for the server
COPY ./server/package*.json ./server/tsconfig.json ./

# Install only production dependencies for the server
RUN npm ci

# Copy the server's source code
COPY ./server/src ./src

# Copy the built application from the build stage
COPY --from=build /app/build /app/public

# Add a non-root user and set permissions
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Set image source label
LABEL org.opencontainers.image.source="https://github.com/fitchmultz/chat-with-gpt"

# Set environment variables
ENV PORT 3000

# Start the server
CMD ["npm", "run", "start"]
