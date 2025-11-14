##See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
#
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install cultures (same approach as Alpine SDK image)
RUN apk add --no-cache icu-libs

# Disable the invariant mode (set in base image)
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src
COPY ["src/ImmoGest.Api.Api/ImmoGest.Api.Api.csproj", "src/ImmoGest.Api.Api/"]
COPY ["src/ImmoGest.Api.Application/ImmoGest.Api.Application.csproj", "src/ImmoGest.Api.Application/"]
COPY ["src/ImmoGest.Api.Domain/ImmoGest.Api.Domain.csproj", "src/ImmoGest.Api.Domain/"]
COPY ["src/ImmoGest.Api.Domain.Core/ImmoGest.Api.Domain.Core.csproj", "src/ImmoGest.Api.Domain.Core/"]
COPY ["src/ImmoGest.Api.Infrastructure/ImmoGest.Api.Infrastructure.csproj", "src/ImmoGest.Api.Infrastructure/"]
COPY . .
WORKDIR "/src/src/ImmoGest.Api.Api"

FROM build AS publish
RUN dotnet publish "ImmoGest.Api.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ImmoGest.Api.Api.dll"]
