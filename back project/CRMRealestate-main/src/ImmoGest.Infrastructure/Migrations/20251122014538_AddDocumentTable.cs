using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("07c245c7-efc7-49db-b8aa-b553a73db435"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("158ce1a2-1ece-4918-8939-53d680fc915e"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("20265ad8-585b-483b-9d8b-2bf383bcb4af"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("204b2a23-6dbc-4bed-a69e-19e0c0416c6a"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("22e2b4ef-bcd3-4cb5-9fa5-3d4d6302d944"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("418db764-7eb6-4a43-b8ed-f05cc1a36472"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("6d0c53fd-0956-463e-a78e-fa53d9f4bf0a"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("7b13ef28-5699-46e3-8e8a-62549b5a7d2a"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("7e75c73d-a0fa-43b5-bb01-6dc3a1af4e08"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("825c1b2b-6ced-4b99-a82f-db478e266568"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b9f668e8-4d97-4f75-bf13-1f77d9607bba"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("0e77e7fc-152d-4263-bf5e-18fcdefdc780"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b372c8ce-27d8-4da2-a9b1-4a6895e1ddd3"));

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Generate = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsLogo = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    IsCachet = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    HtmlBody = table.Column<string>(type: "text", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Example = table.Column<string>(type: "json", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LeaseeId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    TransactionId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CompanyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
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
                    table.ForeignKey(
                        name: "FK_Documents_Leases_LeaseeId",
                        column: x => x.LeaseeId,
                        principalTable: "Leases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documents_Transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 28, DateTimeKind.Unspecified).AddTicks(5390), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 28, DateTimeKind.Unspecified).AddTicks(5391), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("0e50a5c6-3327-470c-a33d-86bb2898f23b"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8971), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8971), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("10df1ea7-c9bf-443e-887f-d053d27cb310"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8952), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8953), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("28202a8c-1f22-4f02-9ec2-eaa7261e8c20"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8973), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8973), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("34c20e4e-19cc-4872-96cd-9a89a639f39b"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8995), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8996), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("4673366a-48d0-47ae-98af-b981da7a5715"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8975), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8976), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("4c6f93da-c62e-4dbd-b57d-e12f56a41240"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(9000), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(9000), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8959), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8960), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("9bc713c3-995d-488c-b5a5-34bbbbe07f37"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8993), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8993), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("e29988e7-6625-40e4-9ab6-d37e1d405cc0"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(9002), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(9003), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("0f4a0360-ead1-4eb2-8d92-3641d6ac739c"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 39, DateTimeKind.Unspecified).AddTicks(1315), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 39, DateTimeKind.Unspecified).AddTicks(737), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 40, DateTimeKind.Unspecified).AddTicks(5418), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 40, DateTimeKind.Unspecified).AddTicks(5410), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 40, DateTimeKind.Unspecified).AddTicks(5422), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 40, DateTimeKind.Unspecified).AddTicks(5419), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 37, 808, DateTimeKind.Unspecified).AddTicks(3593), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 37, 808, DateTimeKind.Unspecified).AddTicks(3594), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$Xd6laBTXEA99Q.CvHEXy/uOTZOILeGhBedT8vpwqsZrBQWKP0cVaW" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 37, 918, DateTimeKind.Unspecified).AddTicks(6701), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 37, 918, DateTimeKind.Unspecified).AddTicks(6704), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$l2gc.Uw7qPFW7kcmQm3sXuYdBgZA8DkPQpykKKyo3bSfWklYL3fQm" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("163bd33f-0ee3-485c-a5c1-08930f4d1f37"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8966), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8966), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("4d10d43c-f0a8-419d-8abb-08f398a800fe"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8968), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8969), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("fa084a6d-54d9-44d2-bdb2-6b7982fb9f41"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8961), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8962), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"), null, "Tenants", "Tenants", "Locataires", "basic" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CompanyId",
                table: "Documents",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_LeaseeId",
                table: "Documents",
                column: "LeaseeId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TransactionId",
                table: "Documents",
                column: "TransactionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("0e50a5c6-3327-470c-a33d-86bb2898f23b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("10df1ea7-c9bf-443e-887f-d053d27cb310"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("163bd33f-0ee3-485c-a5c1-08930f4d1f37"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("28202a8c-1f22-4f02-9ec2-eaa7261e8c20"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("34c20e4e-19cc-4872-96cd-9a89a639f39b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4673366a-48d0-47ae-98af-b981da7a5715"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4c6f93da-c62e-4dbd-b57d-e12f56a41240"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4d10d43c-f0a8-419d-8abb-08f398a800fe"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9bc713c3-995d-488c-b5a5-34bbbbe07f37"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e29988e7-6625-40e4-9ab6-d37e1d405cc0"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fa084a6d-54d9-44d2-bdb2-6b7982fb9f41"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("0f4a0360-ead1-4eb2-8d92-3641d6ac739c"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"));

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 671, DateTimeKind.Unspecified).AddTicks(4414), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 671, DateTimeKind.Unspecified).AddTicks(4415), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("158ce1a2-1ece-4918-8939-53d680fc915e"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6477), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6478), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("20265ad8-585b-483b-9d8b-2bf383bcb4af"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6502), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6502), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("204b2a23-6dbc-4bed-a69e-19e0c0416c6a"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6521), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6521), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("22e2b4ef-bcd3-4cb5-9fa5-3d4d6302d944"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6518), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6519), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("6d0c53fd-0956-463e-a78e-fa53d9f4bf0a"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6513), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6513), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("7b13ef28-5699-46e3-8e8a-62549b5a7d2a"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6507), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6507), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("825c1b2b-6ced-4b99-a82f-db478e266568"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6499), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6500), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("b372c8ce-27d8-4da2-a9b1-4a6895e1ddd3"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6487), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6487), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("b9f668e8-4d97-4f75-bf13-1f77d9607bba"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6504), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6505), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("0e77e7fc-152d-4263-bf5e-18fcdefdc780"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(9499), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(8919), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 684, DateTimeKind.Unspecified).AddTicks(3895), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 684, DateTimeKind.Unspecified).AddTicks(3889), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 684, DateTimeKind.Unspecified).AddTicks(3899), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 684, DateTimeKind.Unspecified).AddTicks(3896), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 438, DateTimeKind.Unspecified).AddTicks(8105), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 438, DateTimeKind.Unspecified).AddTicks(8105), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$dtqAGBS5aEiXdqGZdBHvwu5XfT0T3F4kqv1HN8rZ.HqxwI/HbPTwO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 556, DateTimeKind.Unspecified).AddTicks(316), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 556, DateTimeKind.Unspecified).AddTicks(317), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$wUxpc7epVtQjAuJOGFhmEuiXYYUAkM56s7yzDurZBIlPgkLvdyEey" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("07c245c7-efc7-49db-b8aa-b553a73db435"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6489), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6489), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("b372c8ce-27d8-4da2-a9b1-4a6895e1ddd3"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("418db764-7eb6-4a43-b8ed-f05cc1a36472"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6496), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6497), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("b372c8ce-27d8-4da2-a9b1-4a6895e1ddd3"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("7e75c73d-a0fa-43b5-bb01-6dc3a1af4e08"), new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6493), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 19, 20, 13, 51, 682, DateTimeKind.Unspecified).AddTicks(6493), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("b372c8ce-27d8-4da2-a9b1-4a6895e1ddd3"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });
        }
    }
}
