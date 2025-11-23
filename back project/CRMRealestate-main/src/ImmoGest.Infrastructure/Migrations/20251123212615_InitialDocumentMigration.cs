using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialDocumentMigration : Migration
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
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Generate = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsLogo = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsCachet = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    HtmlBody = table.Column<string>(type: "text", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsLocked = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    Pdfmake = table.Column<string>(type: "text", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Example = table.Column<string>(type: "json", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LeaseeId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true),
                    SearchTerms = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
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
                    DepositPrice = table.Column<double>(type: "double", precision: 18, scale: 2, nullable: false, defaultValue: 0.0),
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
                    DocumentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
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
                        name: "FK_Leases_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
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
                    DepositPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LeaseId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ContactId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    OtherContactName = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ReservationId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
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
                    table.ForeignKey(
                        name: "FK_Transactions_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Companies",
                columns: new[] { "Id", "Address", "City", "CreatedOn", "Email", "Ice", "Image", "LastModifiedOn", "Name", "Phone", "Rc", "Restricted", "SearchTerms", "Website" },
                values: new object[] { new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), "bassatine", "tanger", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 970, DateTimeKind.Unspecified).AddTicks(8409), new TimeSpan(0, 0, 0, 0, 0)), "contact@immosyncpro.com", "51259111", null, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 970, DateTimeKind.Unspecified).AddTicks(8410), new TimeSpan(0, 0, 0, 0, 0)), "IMMOSYNCPRO", "0605934495", "41414111", false, null, "www.immosyncpro.com" });

            migrationBuilder.InsertData(
                table: "Documents",
                columns: new[] { "Id", "CompanyId", "CreatedOn", "Example", "HtmlBody", "IsLocked", "LastModifiedOn", "LeaseeId", "Name", "Pdfmake", "SearchTerms", "Type" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-4789-a012-345678901234"), null, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, null, true, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, "Reservation Agreement", null, null, 1 },
                    { new Guid("b2c3d4e5-f6a7-4890-b123-456789012345"), null, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, null, true, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, "Lease", null, null, 2 },
                    { new Guid("c3d4e5f6-a7b8-4901-c234-567890123456"), null, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, null, true, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, "Reservation Full", null, null, 3 },
                    { new Guid("d4e5f6a7-b8c9-4012-d345-678901234567"), null, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, null, true, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, "Reservation Part", null, null, 4 },
                    { new Guid("e5f6a7b8-c9d0-4123-e456-789012345678"), null, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, null, true, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 983, DateTimeKind.Unspecified).AddTicks(9221), new TimeSpan(0, 0, 0, 0, 0)), null, "Fees", null, null, 5 }
                });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("13349879-e1c0-4466-b985-9203398f0f68"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(527), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(528), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("2216b9ac-1595-473a-849c-88cdc2269708"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(542), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(542), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("2ddf9968-6d84-42c0-badb-7baea018d2ae"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(534), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(534), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("78721e2d-99ee-4f2a-980d-901c488c1457"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(530), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(530), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("7f39ea1a-10b9-4a0e-8346-6c5de8ac5fb6"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(538), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(538), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("7fcba698-3d94-4492-bb06-68fa3413b8d1"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(536), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(536), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("aab3a55d-d22d-46d7-a113-281244809877"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(503), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(504), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("fa0d527f-62bc-41c2-b3c9-d8f717f161a8"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(532), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(532), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("fd7f1880-744a-487b-a9a6-1816d9d4f0c9"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(510), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(510), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("ac57ca42-1b87-47fd-a562-3985101ce32b"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(2464), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(2026), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("0d693d7b-a049-462c-8b9d-d19d2c99f3e6"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(512), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(512), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("fd7f1880-744a-487b-a9a6-1816d9d4f0c9"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("b6373b0d-42a7-4841-b716-55fe78bd6be9"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(525), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(525), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("fd7f1880-744a-487b-a9a6-1816d9d4f0c9"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("fe38a903-0716-4b1b-b80c-be52e67e41f4"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(523), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 980, DateTimeKind.Unspecified).AddTicks(523), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("fd7f1880-744a-487b-a9a6-1816d9d4f0c9"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Avatar", "CompanyId", "CreatedOn", "Email", "LastModifiedOn", "Name", "Password", "Phone", "Role", "SearchTerms" },
                values: new object[,]
                {
                    { new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), null, new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 763, DateTimeKind.Unspecified).AddTicks(9027), new TimeSpan(0, 0, 0, 0, 0)), "admin@admin.com", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 763, DateTimeKind.Unspecified).AddTicks(9028), new TimeSpan(0, 0, 0, 0, 0)), null, "$2a$11$MWF5Drdbgwn2R4I7036Dh.P6H87S8P/VTWOODpPHET6ns.YLpdMJq", null, "Admin", null },
                    { new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"), null, new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 866, DateTimeKind.Unspecified).AddTicks(9464), new TimeSpan(0, 0, 0, 0, 0)), "user@boilerplate.com", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 866, DateTimeKind.Unspecified).AddTicks(9465), new TimeSpan(0, 0, 0, 0, 0)), null, "$2a$11$XaVNoR3GUkcRPgLZM5KTieE9LEiXkIurQ2eEpGaEKwu/m.vljervW", null, "User", null }
                });

            migrationBuilder.InsertData(
                table: "UserPermissions",
                columns: new[] { "Id", "CreatedOn", "LastModifiedOn", "PermissionsJson", "SearchTerms", "UserId" },
                values: new object[,]
                {
                    { new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 981, DateTimeKind.Unspecified).AddTicks(5387), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 981, DateTimeKind.Unspecified).AddTicks(5380), new TimeSpan(0, 0, 0, 0, 0)), "{\n                        \"dashboard\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"properties\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"buildings\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"leasing\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"reservations\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"maintenance\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"contacts\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"keys\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"banks\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"payments\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"file-manager\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"reports\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"settings\": {\"view\": true, \"edit\": true, \"delete\": true}\n                    }", null, new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1") },
                    { new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 981, DateTimeKind.Unspecified).AddTicks(5390), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 26, 14, 981, DateTimeKind.Unspecified).AddTicks(5388), new TimeSpan(0, 0, 0, 0, 0)), "{\n                        \"dashboard\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"properties\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"buildings\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"leasing\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"reservations\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"maintenance\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"contacts\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"keys\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"banks\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"payments\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"file-manager\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"reports\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"settings\": {\"view\": false, \"edit\": false, \"delete\": false}\n                    }", null, new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2") }
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
                name: "IX_Documents_CompanyId",
                table: "Documents",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_LeaseeId",
                table: "Documents",
                column: "LeaseeId");

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
                name: "IX_Leases_DocumentId",
                table: "Leases",
                column: "DocumentId",
                unique: true);

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
                name: "IX_Transactions_ReservationId",
                table: "Transactions",
                column: "ReservationId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Leases_LeaseeId",
                table: "Documents",
                column: "LeaseeId",
                principalTable: "Leases",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
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
                name: "FK_Documents_Leases_LeaseeId",
                table: "Documents");

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
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Properties");

            migrationBuilder.DropTable(
                name: "Buildings");

            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "Reservations");

            migrationBuilder.DropTable(
                name: "Companies");
        }
    }
}
