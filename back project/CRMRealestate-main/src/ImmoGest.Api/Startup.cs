using System.Text;
using System.Text.Json.Serialization;
using ImmoGest.Api.Extensions;
using ImmoGest.Api.Middleware;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Application.Services;
using ImmoGest.Domain.Repositories;
using ImmoGest.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using ImmoGest.Application.Auth;
using ImmoGest.Domain.Auth.Interfaces;
using System.Configuration;
using ImmoGest.Domain.Entities;
using ImmoGest.Application.MappingProfiles;
using ImmoGest.Infrastructure.Services;
using Microsoft.AspNetCore.Http.Features;

namespace ImmoGest.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //Extension method for less clutter in startup
            services.AddApplicationDbContext(Configuration);

            //DI Services and Repos
            services.AddScoped<IHeroRepository, HeroRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<INavigationRepository, NavigationRepository>();
            services.AddScoped<IContactRepository, ContactRepository>();
            services.AddScoped<IPropertyRepository, PropertyRepository>();
            services.AddScoped<IAttachmentRepository, AttachmentRepository>();
            services.AddScoped<ISettingsRepository, SettingsRepository>();
            services.AddScoped<IBuildingRepository, BuildingRepository>();
            services.AddScoped<IKeyRepository, KeyRepository>();
            services.AddScoped<ILeaseRepository, LeaseRepository>();
            services.AddScoped<IReservationRepository, ReservationRepository>();
            services.AddScoped<IBankRepository, BankRepository>();
            services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();
            services.AddScoped<IUserPermissionsRepository, UserPermissionsRepository>();
            services.AddScoped<ITaskRepository, TaskRepository>();
            services.AddScoped<ITransactionRepository, TransactionRepository>();
            services.AddScoped<IDocumentRepository, DocumentRepository>();
            services.AddScoped<ICompanyRepository, CompanyRepository>();

            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IHeroService, HeroService>();
            services.AddScoped<INavigationService, NavigationService>();
            services.AddScoped<IContactService, ContactService>();
            services.AddScoped<IPropertyService, PropertyService>();
            services.AddScoped<IAttachmentService, AttachmentService>();
            services.AddScoped<ISettingsService, SettingsService>();
            services.AddScoped<IBuildingService, BuildingService>();
            services.AddScoped<IKeyService, KeyService>();
            services.AddScoped<ILeaseService, LeaseService>();
            services.AddScoped<IReservationService, ReservationService>();
            services.AddScoped<IBankService, BankService>();
            services.AddScoped<IMaintenanceService, MaintenanceService>();
            services.AddScoped<IUserPermissionsService, UserPermissionsService>();
            services.AddScoped<ITaskService, TaskService>();
            services.AddScoped<ITransactionService, TransactionService>();
            services.AddScoped<IDocumentService, DocumentService>();

            services.AddScoped<ISession, Session>();

            // WebApi Configuration
            services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.IgnoreNullValues = true;
                // Removed JsonStringEnumConverter - enums will be serialized as numbers (default)
                // This is more efficient and type-safe for API communication
                // options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

            var tokenConfig = Configuration.GetSection("TokenConfiguration");
            services.Configure<TokenConfiguration>(tokenConfig);

            // configure jwt authentication
            var appSettings = tokenConfig.Get<TokenConfiguration>();
            var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            services.AddAuthentication(x =>
                {
                    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(x =>
                {
                    x.RequireHttpsMetadata = Environment.IsProduction();
                    x.SaveToken = true;
                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = appSettings.Issuer,
                        ValidAudience = appSettings.Audience
                    };
                });

            // AutoMapper settings
            services.AddAutoMapperSetup();

            // HttpContext for log enrichment 
            services.AddHttpContextAccessor();

            // Swagger settings
            services.AddApiDoc();
            // GZip compression
            services.AddCompression();

            // AWS S3 Storage Configuration
            services.AddScoped<IS3StorageService, S3StorageService>();
            
            // File Attachment Helper
            services.AddScoped<FileAttachmentHelper>();

            // Configure form options for large file uploads
            services.Configure<FormOptions>(options =>
            {
                options.ValueLengthLimit = int.MaxValue;
                options.MultipartBodyLengthLimit = 500 * 1024 * 1024; // 500MB
                options.MultipartHeadersLengthLimit = int.MaxValue;
                options.MultipartBoundaryLengthLimit = int.MaxValue;
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<Startup> logger)
        {
            if (env.IsDevelopment()) app.UseDeveloperExceptionPage();
            // app.UseCustomSerilogRequestLogging(); // Disabled to remove HTTP request logging
            app.UseRouting();
            
            // Swagger basic authentication
            app.UseMiddleware<SwaggerBasicAuthMiddleware>();
            
            app.UseApiDoc();

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseCors(builder =>
            {
                builder
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .SetIsOriginAllowed(_ => true)
                    .AllowCredentials();
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseHttpsRedirection();
            app.UseResponseCompression();
        }
    }
}
