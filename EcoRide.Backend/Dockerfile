# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution file
COPY EcoRide.Backend.sln .

# Copy all project files (maintaining directory structure)
COPY EcoRide.Backend.Data/EcoRide.Backend.Data.csproj EcoRide.Backend.Data/
COPY EcoRide.Backend.Dtos/EcoRide.Backend.Dtos.csproj EcoRide.Backend.Dtos/
COPY EcoRide.Backend.Business/EcoRide.Backend.Business.csproj EcoRide.Backend.Business/
COPY EcoRide.Backend.Client/EcoRide.Backend.Client.csproj EcoRide.Backend.Client/
COPY EcoRide.Backend.WebApi/EcoRide.Backend.WebApi.csproj EcoRide.Backend.WebApi/
COPY EcoRide.Backend.Tests/EcoRide.Backend.Tests.csproj EcoRide.Backend.Tests/

# Restore dependencies for all projects
RUN dotnet restore EcoRide.Backend.sln

# Copy all source code
COPY EcoRide.Backend.Data/ EcoRide.Backend.Data/
COPY EcoRide.Backend.Dtos/ EcoRide.Backend.Dtos/
COPY EcoRide.Backend.Business/ EcoRide.Backend.Business/
COPY EcoRide.Backend.Client/ EcoRide.Backend.Client/
COPY EcoRide.Backend.WebApi/ EcoRide.Backend.WebApi/
COPY EcoRide.Backend.Tests/ EcoRide.Backend.Tests/

# Build the solution
RUN dotnet build EcoRide.Backend.sln -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish EcoRide.Backend.WebApi/EcoRide.Backend.WebApi.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .

# Expose port
EXPOSE 5000

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "EcoRide.Backend.WebApi.dll"]
