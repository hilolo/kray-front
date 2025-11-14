using System;
using ImmoGest.Infrastructure.Context;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace ImmoGest.Api.Extensions
{
    public static class DatabaseExtension
    {
        public static void AddApplicationDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(o =>
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                o.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 21)));
            });
        }
    }
}
