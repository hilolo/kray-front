using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(254)", maxLength: 254, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Website = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    City = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Rc = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Ice = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Image = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Restricted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Heroes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Nickname = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Individuality = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Age = table.Column<int>(type: "int", nullable: true),
                    HeroType = table.Column<int>(type: "int", nullable: false),
                    Team = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Heroes", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "NavigationItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ItemId = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Title = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TitleEn = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TitleFr = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Type = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Icon = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Link = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ParentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Order = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NavigationItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NavigationItems_NavigationItems_ParentId",
                        column: x => x.ParentId,
                        principalTable: "NavigationItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyId = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DefaultCity = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CategoriesJson = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FeaturesJson = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AmenitiesJson = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyTypesJson = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FirstName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LastName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Ice = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Rc = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Identifier = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsACompany = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    Email = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phones = table.Column<string>(type: "json", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Avatar = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AvatarStorageHash = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contacts_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Email = table.Column<string>(type: "varchar(254)", maxLength: 254, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Password = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Avatar = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Banks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    BankName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RIB = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IBAN = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Swift = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Banks_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Banks_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserPermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    PermissionsJson = table.Column<string>(type: "json", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPermissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FileName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OriginalFileName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FileExtension = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    Root = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StorageHash = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LeaseId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ReservationId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    KeyId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    TransactionId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Url = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UrlExpiresAt = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Attachments_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Buildings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    City = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Construction = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    DefaultAttachmentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Buildings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Buildings_Attachments_DefaultAttachmentId",
                        column: x => x.DefaultAttachmentId,
                        principalTable: "Attachments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Buildings_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Identifier = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    City = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TypeProperty = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Area = table.Column<float>(type: "float", nullable: false),
                    Pieces = table.Column<float>(type: "float", nullable: false),
                    Bathrooms = table.Column<float>(type: "float", nullable: false),
                    Furnished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Price = table.Column<float>(type: "float", nullable: false),
                    TypePaiment = table.Column<int>(type: "int", nullable: false),
                    BuildingId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DefaultAttachmentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Features = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Equipment = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsPublic = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsPublicAdresse = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsReservationShow = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Properties_Attachments_DefaultAttachmentId",
                        column: x => x.DefaultAttachmentId,
                        principalTable: "Attachments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Properties_Buildings_BuildingId",
                        column: x => x.BuildingId,
                        principalTable: "Buildings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Properties_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Properties_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Keys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DefaultAttachmentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Keys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Keys_Attachments_DefaultAttachmentId",
                        column: x => x.DefaultAttachmentId,
                        principalTable: "Attachments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Keys_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Leases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenancyStart = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    TenancyEnd = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    PaymentType = table.Column<int>(type: "int", nullable: false),
                    PaymentMethod = table.Column<int>(type: "int", nullable: false),
                    PaymentDate = table.Column<int>(type: "int", nullable: false),
                    RentPrice = table.Column<double>(type: "double", precision: 18, scale: 2, nullable: false),
                    EnableReceipts = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    NotificationWhatsapp = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    NotificationEmail = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    SpecialTerms = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrivateNote = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leases_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Leases_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Leases_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Maintenances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Subject = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ScheduledDateTime = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Maintenances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Maintenances_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Maintenances_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Maintenances_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Reservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StartDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DurationDays = table.Column<int>(type: "int", nullable: false),
                    NumberOfNights = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Reason = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RequestDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ApprovedBy = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ApprovalDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ApprovalNotes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrivateNote = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reservations_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reservations_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reservations_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Title = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    ScheduledDateTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AssignedUserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tasks_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tasks_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tasks_Users_AssignedUserId",
                        column: x => x.AssignedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Category = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RevenueType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExpenseType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TransactionType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Payments = table.Column<string>(type: "json", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LeaseId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Leases_LeaseId",
                        column: x => x.LeaseId,
                        principalTable: "Leases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Transactions_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Companies",
                columns: new[] { "Id", "Address", "City", "CreatedOn", "Email", "Ice", "Image", "LastModifiedOn", "Name", "Phone", "Rc", "Restricted", "SearchTerms", "Website" },
                values: new object[] { new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), "bassatine", "tanger", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 47, DateTimeKind.Unspecified).AddTicks(7287), new TimeSpan(0, 0, 0, 0, 0)), "contact@immosyncpro.com", "51259111", null, new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 47, DateTimeKind.Unspecified).AddTicks(7288), new TimeSpan(0, 0, 0, 0, 0)), "IMMOSYNCPRO", "0605934495", "41414111", false, null, "www.immosyncpro.com" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("095b8ce0-1ca8-44f0-8a76-13fe0b689795"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7624), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7625), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("20489ab0-926b-47f4-adc4-c7ed1d7977c6"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7640), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7640), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("529bdb19-1374-455a-8552-e54aa8647b7c"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7637), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7638), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("55ab7bd4-2022-4a82-a7e3-0769bdf47a65"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7613), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7613), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("702f976c-b9ac-404a-a9ec-ea89fb5f3911"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7629), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7629), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("90f1572c-0108-4fa0-a7d4-d890d1c29e13"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7631), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7631), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("a0cfda1d-a7bf-4c68-be2f-24e70469aa6f"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7598), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7599), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("b3810465-224b-4f9d-bece-772f2fa9e562"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7627), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7627), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("f4d0326e-1486-42ad-8092-7aa04ade03bd"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7622), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7623), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("9c07a5fc-7e5e-4004-851f-2c9946e53cb6"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(9843), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(9339), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("01c51f78-78cd-4fa4-b653-c7bb7d52ceaf"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7620), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7621), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("55ab7bd4-2022-4a82-a7e3-0769bdf47a65"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("ad7d325c-0371-47c2-9fe2-490a8d75dc03"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7614), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7615), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("55ab7bd4-2022-4a82-a7e3-0769bdf47a65"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("ea86a8aa-31c5-4c6a-85c5-74259c758c21"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7618), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 55, DateTimeKind.Unspecified).AddTicks(7618), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("55ab7bd4-2022-4a82-a7e3-0769bdf47a65"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Avatar", "CompanyId", "CreatedOn", "Email", "LastModifiedOn", "Name", "Password", "Phone", "Role", "SearchTerms" },
                values: new object[,]
                {
                    { new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), null, new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 56, 838, DateTimeKind.Unspecified).AddTicks(9934), new TimeSpan(0, 0, 0, 0, 0)), "admin@admin.com", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 56, 838, DateTimeKind.Unspecified).AddTicks(9936), new TimeSpan(0, 0, 0, 0, 0)), null, "$2a$11$6ZGDLLrNTpItU2MsrAtMMerBVRwXvPcEoiH5K9ase3sluy5yGMIHa", null, "Admin", null },
                    { new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"), null, new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 56, 941, DateTimeKind.Unspecified).AddTicks(9719), new TimeSpan(0, 0, 0, 0, 0)), "user@boilerplate.com", new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 56, 941, DateTimeKind.Unspecified).AddTicks(9722), new TimeSpan(0, 0, 0, 0, 0)), null, "$2a$11$CzOmjhW0sIw4Iho5ZdO4DeyuV.oY4JP.h7t9PRHruEa1ui8w/F5ha", null, "User", null }
                });

            migrationBuilder.InsertData(
                table: "UserPermissions",
                columns: new[] { "Id", "CreatedOn", "LastModifiedOn", "PermissionsJson", "SearchTerms", "UserId" },
                values: new object[,]
                {
                    { new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 57, DateTimeKind.Unspecified).AddTicks(1262), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 57, DateTimeKind.Unspecified).AddTicks(1256), new TimeSpan(0, 0, 0, 0, 0)), "{\n                        \"dashboard\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"properties\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"buildings\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"leasing\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"reservations\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"maintenance\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"contacts\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"keys\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"banks\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"payments\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"file-manager\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"reports\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"settings\": {\"view\": true, \"edit\": true, \"delete\": true}\n                    }", null, new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1") },
                    { new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 57, DateTimeKind.Unspecified).AddTicks(1266), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 19, 21, 57, 57, DateTimeKind.Unspecified).AddTicks(1263), new TimeSpan(0, 0, 0, 0, 0)), "{\n                        \"dashboard\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"properties\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"buildings\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"leasing\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"reservations\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"maintenance\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"contacts\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"keys\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"banks\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"payments\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"file-manager\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"reports\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"settings\": {\"view\": false, \"edit\": false, \"delete\": false}\n                    }", null, new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_ContactId",
                table: "Attachments",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_KeyId",
                table: "Attachments",
                column: "KeyId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_LeaseId",
                table: "Attachments",
                column: "LeaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_PropertyId",
                table: "Attachments",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_ReservationId",
                table: "Attachments",
                column: "ReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_StorageHash",
                table: "Attachments",
                column: "StorageHash");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_TransactionId",
                table: "Attachments",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Banks_CompanyId",
                table: "Banks",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Banks_ContactId",
                table: "Banks",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Buildings_CompanyId",
                table: "Buildings",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Buildings_DefaultAttachmentId",
                table: "Buildings",
                column: "DefaultAttachmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_Email",
                table: "Companies",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_CompanyId",
                table: "Contacts",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Keys_DefaultAttachmentId",
                table: "Keys",
                column: "DefaultAttachmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Keys_PropertyId",
                table: "Keys",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Leases_CompanyId",
                table: "Leases",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Leases_ContactId",
                table: "Leases",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Leases_PropertyId",
                table: "Leases",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Maintenances_CompanyId",
                table: "Maintenances",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Maintenances_ContactId",
                table: "Maintenances",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Maintenances_PropertyId",
                table: "Maintenances",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Maintenances_ScheduledDateTime",
                table: "Maintenances",
                column: "ScheduledDateTime");

            migrationBuilder.CreateIndex(
                name: "IX_Maintenances_Status",
                table: "Maintenances",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_NavigationItems_ItemId",
                table: "NavigationItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_NavigationItems_Order",
                table: "NavigationItems",
                column: "Order");

            migrationBuilder.CreateIndex(
                name: "IX_NavigationItems_ParentId",
                table: "NavigationItems",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_BuildingId",
                table: "Properties",
                column: "BuildingId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_CompanyId",
                table: "Properties",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_ContactId",
                table: "Properties",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_DefaultAttachmentId",
                table: "Properties",
                column: "DefaultAttachmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Identifier",
                table: "Properties",
                column: "Identifier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CompanyId",
                table: "Reservations",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ContactId",
                table: "Reservations",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_PropertyId",
                table: "Reservations",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Settings_CompanyId",
                table: "Settings",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Settings_IsDeleted",
                table: "Settings",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssignedUserId",
                table: "Tasks",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_CompanyId",
                table: "Tasks",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ContactId",
                table: "Tasks",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_PropertyId",
                table: "Tasks",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CompanyId",
                table: "Transactions",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ContactId",
                table: "Transactions",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_LeaseId",
                table: "Transactions",
                column: "LeaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_PropertyId",
                table: "Transactions",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId",
                table: "UserPermissions",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_CompanyId",
                table: "Users",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Keys_KeyId",
                table: "Attachments",
                column: "KeyId",
                principalTable: "Keys",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Leases_LeaseId",
                table: "Attachments",
                column: "LeaseId",
                principalTable: "Leases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Properties_PropertyId",
                table: "Attachments",
                column: "PropertyId",
                principalTable: "Properties",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Reservations_ReservationId",
                table: "Attachments",
                column: "ReservationId",
                principalTable: "Reservations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Transactions_TransactionId",
                table: "Attachments",
                column: "TransactionId",
                principalTable: "Transactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Contacts_ContactId",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Leases_Contacts_ContactId",
                table: "Leases");

            migrationBuilder.DropForeignKey(
                name: "FK_Properties_Contacts_ContactId",
                table: "Properties");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Contacts_ContactId",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Contacts_ContactId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Keys_KeyId",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Leases_LeaseId",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Leases_LeaseId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Properties_PropertyId",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Properties_PropertyId",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Properties_PropertyId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "Banks");

            migrationBuilder.DropTable(
                name: "Heroes");

            migrationBuilder.DropTable(
                name: "Maintenances");

            migrationBuilder.DropTable(
                name: "NavigationItems");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "UserPermissions");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Contacts");

            migrationBuilder.DropTable(
                name: "Keys");

            migrationBuilder.DropTable(
                name: "Leases");

            migrationBuilder.DropTable(
                name: "Properties");

            migrationBuilder.DropTable(
                name: "Buildings");

            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "Reservations");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "Companies");
        }
    }
}
