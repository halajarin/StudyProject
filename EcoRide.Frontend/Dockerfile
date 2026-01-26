# Build stage
FROM clauger3e.azurecr.io/node:22.17.0-alpine-patched AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (with legacy peer deps to handle Angular version conflicts)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular application with base-href for Traefik routing
# The base-href ensures assets are requested with /portal/ecoride/ prefix
# Traefik's stripPrefixRegex then removes it before routing to nginx
RUN npm run build -- --base-href /portal/ecoride/

# Production stage
FROM clauger3e.azurecr.io/nginx:alpine-patched AS final
WORKDIR /usr/share/nginx/html

# Remove default nginx static content
RUN rm -rf ./*

# Copy built application from build stage
COPY --from=build /app/dist/ecoride-frontend/browser ./

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
