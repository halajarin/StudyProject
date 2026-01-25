# Build stage
FROM clauger3e.azurecr.io/node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (with legacy peer deps to handle Angular version conflicts)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular application
RUN npm run build

# Production stage
FROM clauger3e.azurecr.io/nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Remove default nginx static content
RUN rm -rf ./*

# Copy built application from build stage
COPY --from=build /app/dist/ecoride-frontend/browser ./

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
