using System;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ImmoGest.Api.Middleware
{
    public class SwaggerBasicAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private const string SwaggerPassword = "hilala123";

        public SwaggerBasicAuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Check if the request is for Swagger
            if (context.Request.Path.StartsWithSegments("/swagger") || 
                context.Request.Path.StartsWithSegments("/api-docs"))
            {
                string authHeader = context.Request.Headers["Authorization"];
                if (authHeader != null && authHeader.StartsWith("Basic "))
                {
                    // Get the encoded username and password
                    var encodedUsernamePassword = authHeader.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries)[1]?.Trim();

                    // Decode from Base64 to string
                    var decodedUsernamePassword = Encoding.UTF8.GetString(Convert.FromBase64String(encodedUsernamePassword));

                    // Split username and password
                    var password = decodedUsernamePassword.Split(':', 2)[1];

                    // Check if password is correct
                    if (password == SwaggerPassword)
                    {
                        await _next.Invoke(context);
                        return;
                    }
                }

                // Return authentication request
                context.Response.Headers["WWW-Authenticate"] = "Basic realm=\"Swagger\"";
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            }
            else
            {
                await _next.Invoke(context);
            }
        }
    }
}

