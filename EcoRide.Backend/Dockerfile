# Étape 1 : Build
FROM clauger3e.azurecr.io/dotnet/sdk:8.0-patched AS build

WORKDIR /app

# Copier le code source complet des projets
COPY . ./

# Restaurer les dépendances pour le projet principal (WebAPI)
RUN dotnet restore ./EcoRide.Backend.WebApi/EcoRide.Backend.WebApi.csproj

# Compiler et publier l'application WebAPI
RUN dotnet publish ./EcoRide.Backend.WebApi/EcoRide.Backend.WebApi.csproj \
    -c Release \
    -o /app/publish

# Étape 2 : Runtime
FROM clauger3e.azurecr.io/dotnet/aspnet:8.0-patched

WORKDIR /app

# Copier les fichiers publiés depuis l'étape précédente
COPY --from=build /app/publish .

# Exposer le port utilisé par l'application
EXPOSE 8080

RUN mkdir cookies

# Définir le point d'entrée de l'application
ENTRYPOINT ["dotnet", "EcoRide.Backend.WebApi.dll"]
