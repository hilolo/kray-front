using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactionEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("05a52cd0-7eb5-4248-a0d0-ac4afca00e63"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("11bfc124-2332-423f-93fa-ec93db99a9bc"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("31b07056-eed5-4fbf-977c-72d9b1a286d2"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("43683c72-6766-49e2-b071-b2fc29126e01"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("46be1dd4-c4bb-4563-9222-fea1ed23b073"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("59db4be2-1def-42f3-826a-293d7b2f89a2"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("6c51cf72-840d-4f6b-955d-9de5caac391b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("8509b8ed-4171-4976-869a-e9d140fa9b4d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("dc87e337-f445-4397-9935-03af8d6f6ed1"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("df9cd22d-95ce-44f6-bac5-c0f957330bac"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("f2435278-767c-4775-82ff-56f19257d6dc"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("97933250-30c8-446e-9d9f-3f69e6231b94"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c2cf5cdb-a6f7-46cf-9734-b8d4dd1c59b5"));

            migrationBuilder.AddColumn<Guid>(
                name: "TransactionId",
                table: "Attachments",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Category = table.Column<int>(type: "int", nullable: false),
                    RevenueType = table.Column<int>(type: "int", nullable: true),
                    ExpenseType = table.Column<int>(type: "int", nullable: true),
                    TransactionType = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Payments = table.Column<string>(type: "json", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
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
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 159, DateTimeKind.Unspecified).AddTicks(3838), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 159, DateTimeKind.Unspecified).AddTicks(3839), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("07505c65-5e2e-417e-89e6-5e3c0138ccec"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8200), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8200), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("087e78af-a4d2-48c7-afa8-2cad9f89a9b8"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8189), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8190), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("42191b3a-4087-4106-8258-1fce9ec2b931"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8176), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8176), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("584bef71-ad19-4c5f-b807-75ed0c051938"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8154), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8155), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("6638e0d3-c7e3-41f7-9970-cb09ef8423ff"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8187), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8187), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8161), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8161), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("83521c7a-30b9-4193-bd04-2d4d130b3772"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8197), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8197), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("e9a2c0a7-67cc-4e6e-9b4b-a4e77d5710b5"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8192), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8192), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("ef1b1233-ec6f-43cc-8ea9-9212a2908dc8"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8173), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8174), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("83510011-f11c-4c48-8076-dc54e7d99602"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 170, DateTimeKind.Unspecified).AddTicks(657), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 170, DateTimeKind.Unspecified).AddTicks(42), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 171, DateTimeKind.Unspecified).AddTicks(4884), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 171, DateTimeKind.Unspecified).AddTicks(4878), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 171, DateTimeKind.Unspecified).AddTicks(4888), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 171, DateTimeKind.Unspecified).AddTicks(4885), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 43, 911, DateTimeKind.Unspecified).AddTicks(4767), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 43, 911, DateTimeKind.Unspecified).AddTicks(4768), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$HDS.6ygo7eN4497AhpzD7.5ZCZZYn5T.butuROcRhmTEyeuQuPL72" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 35, DateTimeKind.Unspecified).AddTicks(4353), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 35, DateTimeKind.Unspecified).AddTicks(4357), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$E8LdKSGmztF3r8cBl.Wq9uiar18HadqUmc96xwsgfNuJzph9ElAhm" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("b0ad06b1-85b5-4443-85d1-9587ed56d076"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8163), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8163), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("c4ace36e-d866-4fe8-95cd-573af0422fdb"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8168), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8169), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("cebdbcf2-55d1-437b-9719-2aa9a680e44d"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8171), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8171), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_TransactionId",
                table: "Attachments",
                column: "TransactionId");

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
                name: "FK_Attachments_Transactions_TransactionId",
                table: "Attachments");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_TransactionId",
                table: "Attachments");

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("07505c65-5e2e-417e-89e6-5e3c0138ccec"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("087e78af-a4d2-48c7-afa8-2cad9f89a9b8"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("42191b3a-4087-4106-8258-1fce9ec2b931"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("584bef71-ad19-4c5f-b807-75ed0c051938"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("6638e0d3-c7e3-41f7-9970-cb09ef8423ff"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("83521c7a-30b9-4193-bd04-2d4d130b3772"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b0ad06b1-85b5-4443-85d1-9587ed56d076"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c4ace36e-d866-4fe8-95cd-573af0422fdb"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("cebdbcf2-55d1-437b-9719-2aa9a680e44d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e9a2c0a7-67cc-4e6e-9b4b-a4e77d5710b5"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("ef1b1233-ec6f-43cc-8ea9-9212a2908dc8"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("83510011-f11c-4c48-8076-dc54e7d99602"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"));

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Attachments");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 818, DateTimeKind.Unspecified).AddTicks(7040), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 818, DateTimeKind.Unspecified).AddTicks(7045), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("05a52cd0-7eb5-4248-a0d0-ac4afca00e63"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9448), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9449), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("43683c72-6766-49e2-b071-b2fc29126e01"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9451), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9451), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("46be1dd4-c4bb-4563-9222-fea1ed23b073"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9438), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9438), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("59db4be2-1def-42f3-826a-293d7b2f89a2"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9458), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9458), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("6c51cf72-840d-4f6b-955d-9de5caac391b"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9410), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9411), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("8509b8ed-4171-4976-869a-e9d140fa9b4d"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9436), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9436), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("c2cf5cdb-a6f7-46cf-9734-b8d4dd1c59b5"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9420), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9420), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("dc87e337-f445-4397-9935-03af8d6f6ed1"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9433), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9434), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("df9cd22d-95ce-44f6-bac5-c0f957330bac"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9460), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9461), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("97933250-30c8-446e-9d9f-3f69e6231b94"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 830, DateTimeKind.Unspecified).AddTicks(2033), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 830, DateTimeKind.Unspecified).AddTicks(1391), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 831, DateTimeKind.Unspecified).AddTicks(5625), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 831, DateTimeKind.Unspecified).AddTicks(5616), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 831, DateTimeKind.Unspecified).AddTicks(5630), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 831, DateTimeKind.Unspecified).AddTicks(5626), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 562, DateTimeKind.Unspecified).AddTicks(8781), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 562, DateTimeKind.Unspecified).AddTicks(8782), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$DXPyyVaaCm/oN5qYQMd1J.L7x12tT2GdUtClLjsymV4QpvcSsR4QO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 693, DateTimeKind.Unspecified).AddTicks(3777), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 693, DateTimeKind.Unspecified).AddTicks(3782), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$xyW2ciSvLSVbAn2g1qG.L.gd961Oi.0j4h32toYQs8DVzgOTPAhye" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("11bfc124-2332-423f-93fa-ec93db99a9bc"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9422), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9422), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("c2cf5cdb-a6f7-46cf-9734-b8d4dd1c59b5"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("31b07056-eed5-4fbf-977c-72d9b1a286d2"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9427), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9428), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("c2cf5cdb-a6f7-46cf-9734-b8d4dd1c59b5"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("f2435278-767c-4775-82ff-56f19257d6dc"), new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9430), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 18, 1, 8, 58, 829, DateTimeKind.Unspecified).AddTicks(9430), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("c2cf5cdb-a6f7-46cf-9734-b8d4dd1c59b5"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });
        }
    }
}
