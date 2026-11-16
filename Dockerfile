# Build the React client.
FROM node:22-alpine AS frontend-build
WORKDIR /client
COPY client/package.json client/package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY client/ ./
RUN npx react-scripts build

# Publish the ASP.NET Core application.
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS app-build
WORKDIR /src
COPY InventoryManagement.csproj ./
RUN dotnet restore InventoryManagement.csproj
COPY . ./
RUN rm -rf ./wwwroot/static
COPY --from=frontend-build /client/build/ ./wwwroot/
RUN dotnet publish InventoryManagement.csproj -c Release -o /out --no-restore

# Minimal runtime image with a non-root application user.
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
RUN adduser -D -u 10001 appuser
COPY --from=app-build --chown=appuser:appuser /out/ ./
USER appuser
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "InventoryManagement.dll"]
