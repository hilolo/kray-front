using System;
using System.Threading.Tasks;
using ImmoGest.Api.Extensions;
using ImmoGest.Infrastructure.Context;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Sentry;
using Serilog;

namespace ImmoGest.Api
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            Log.Logger = SerilogExtension.CreateLogger();
            var host = CreateHostBuilder(args).Build();
            using var scope = host.Services.CreateScope();
            var services = scope.ServiceProvider;

            try
            {
                Log.Logger.Warning("Application starting up...");
                var dbContext = services.GetRequiredService<ApplicationDbContext>();
                    await dbContext.Database.MigrateAsync();

                await host.RunAsync();
            }
            catch(Exception ex)
            {
                Log.Logger.Fatal(ex, "Application startup failed.");
                throw;
            }
            finally
            {
                Log.CloseAndFlush();
            }
            
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                .UseSerilog()
                .ConfigureWebHostDefaults(webBuilder => 
                { 
                    webBuilder.UseStartup<Startup>();
                    // Configure Sentry
                    webBuilder.UseSentry(o =>
                    {
                        o.Dsn = "https://554c3cf5b1357fcc76ab82c8116c39e2@o4506500990042112.ingest.us.sentry.io/4510302679859200";
                        // Disable debug logs to keep console clean
                        o.Debug = false;
                        // Set TracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
                        o.TracesSampleRate = 1.0;
                        // Enable Global Mode since this is a server app
                        o.IsGlobalModeEnabled = true;
                        // Capture logs from ILogger
                        o.MinimumBreadcrumbLevel = Microsoft.Extensions.Logging.LogLevel.Information;
                        o.MinimumEventLevel = Microsoft.Extensions.Logging.LogLevel.Warning;
                        // Attach stack traces to all events
                        o.AttachStacktrace = true;
                        // Send Personally Identifiable Information (useful for debugging)
                        o.SendDefaultPii = true;
                    });
                    webBuilder.ConfigureKestrel(options =>
                    {
                        // Configure Kestrel for large file uploads
                        options.Limits.MaxRequestBodySize = 500 * 1024 * 1024; // 500MB
                        options.Limits.MaxRequestBufferSize = 500 * 1024 * 1024; // 500MB
                        options.Limits.MaxRequestLineSize = 8192; // 8KB
                        options.Limits.MaxRequestHeadersTotalSize = 32768; // 32KB
                    });
                });
        }
    }
}
