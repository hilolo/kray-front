using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Sentry.Serilog;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Sinks.SystemConsole.Themes;
using Microsoft.AspNetCore.Http;

namespace ImmoGest.Api.Extensions
{
    public static class SerilogExtension
    {
        public static Logger CreateLogger()
        {
            var configuration = LoadAppConfiguration();
            var loggerConfiguration = new LoggerConfiguration();
            
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Testing") 
                return loggerConfiguration.MinimumLevel.Fatal().CreateLogger();


            return loggerConfiguration
                .ReadFrom.Configuration(configuration)
                .MinimumLevel.Information()  // Changed from Warning to Information to show more logs
                .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
                .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Infrastructure", LogEventLevel.Warning)
                .MinimumLevel.Override("Microsoft.AspNetCore.Diagnostics.HealthCheckMiddleware", LogEventLevel.Warning)
                .Destructure.AsScalar<JObject>()
                .Destructure.AsScalar<JArray>()
                .WriteTo.Async(a => a.Console(
                    restrictedToMinimumLevel: LogEventLevel.Information,  // Changed from Warning to Information
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}",
                    theme: AnsiConsoleTheme.Code))
                .WriteTo.Sentry(o =>
                {
                    // Configure Sentry sink
                    o.Dsn = "https://554c3cf5b1357fcc76ab82c8116c39e2@o4506500990042112.ingest.us.sentry.io/4510302679859200";
                    o.MinimumBreadcrumbLevel = LogEventLevel.Information;
                    o.MinimumEventLevel = LogEventLevel.Warning; // Only send Warning and above to Sentry
                    o.Debug = false; // Disable Sentry debug logs
                    o.AttachStacktrace = true;
                    o.SendDefaultPii = true; // Send Personally Identifiable Information
                    o.TracesSampleRate = 1.0;
                })
                .Enrich.WithExceptionDetails()
                .Enrich.FromLogContext()
                .Enrich.WithEnvironmentName()
                .Enrich.WithMachineName()
                .CreateLogger();
        }

        public static IApplicationBuilder UseCustomSerilogRequestLogging(this IApplicationBuilder app)
        {
            app.UseSerilogRequestLogging(c =>
            {
                c.MessageTemplate = "HTTP {RequestMethod} {RequestPath} from {IP} responded {StatusCode} in {Elapsed:0.0000} ms";
                c.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
                {
                    var ip = GetClientIPAddress(httpContext);
                    diagnosticContext.Set("IP", ip);
                    diagnosticContext.Set("UserName", httpContext.User?.Identity?.Name ?? "Anonymous");
                    diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
                    diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
                    diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
                    diagnosticContext.Set("RequestQueryString", httpContext.Request.QueryString.Value);
                    diagnosticContext.Set("Route", $"{httpContext.Request.Method} {httpContext.Request.Path}");
                    
                    // Log all headers for debugging
                    foreach (var header in httpContext.Request.Headers)
                    {
                        diagnosticContext.Set($"Header_{header.Key}", header.Value.ToString());
                    }
                };
            });

            return app;
        }

        private static string GetClientIPAddress(HttpContext context)
        {
            string ip = string.Empty;

            // Try to get IP from X-Forwarded-For header (for proxy scenarios)
            if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                ip = context.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim();
            }
            // Try to get IP from X-Real-IP header
            else if (context.Request.Headers.ContainsKey("X-Real-IP"))
            {
                ip = context.Request.Headers["X-Real-IP"].ToString();
            }
            // Try to get IP from CF-Connecting-IP header (Cloudflare)
            else if (context.Request.Headers.ContainsKey("CF-Connecting-IP"))
            {
                ip = context.Request.Headers["CF-Connecting-IP"].ToString();
            }
            // Get IP from RemoteIpAddress
            else if (context.Connection.RemoteIpAddress != null)
            {
                ip = context.Connection.RemoteIpAddress.ToString();
            }

            // If still no IP, try to get from HTTP_X_FORWARDED_FOR
            if (string.IsNullOrEmpty(ip) && context.Request.Headers.ContainsKey("HTTP_X_FORWARDED_FOR"))
            {
                ip = context.Request.Headers["HTTP_X_FORWARDED_FOR"].ToString().Split(',')[0].Trim();
            }

            // Handle localhost/loopback addresses
            if (ip == "::1" || ip == "127.0.0.1")
            {
                return "localhost";
            }

            return string.IsNullOrEmpty(ip) ? "Unknown" : ip;
        }

        private static IConfigurationRoot LoadAppConfiguration()
        {
            return new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", false, true)
                .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", true)
                .AddJsonFile("appsettings.local.json", true)
                .Build();
        }
    }
}
