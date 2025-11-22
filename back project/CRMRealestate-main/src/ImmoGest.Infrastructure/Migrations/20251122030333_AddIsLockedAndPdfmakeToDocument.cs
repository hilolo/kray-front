using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsLockedAndPdfmakeToDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("14daba16-b074-4c2b-b267-c4ca664e61ce"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("2cab1771-48e5-48ba-8e9d-bbc6bb4f9814"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("2ce794c5-59c4-475d-a1cb-e74a72d706c2"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("48b55d4e-03a5-4a82-899d-6f84f669527b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4efa9ce3-e7f7-4388-b4dd-993ba3cc8899"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("51b99c9c-0f5f-4edb-9348-68f443d08d2b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("6e415a7c-3b92-4e96-8e55-6faa681c8731"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("78182035-89ac-4ee3-86c9-989d3289913c"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("8e5dd061-206e-49a4-8de6-c0870e7a64e5"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("d02ce931-0c28-433b-af39-04ccf8e9fee0"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("d17dd395-a274-474e-85d9-2e2acc9e6c2e"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("32bdd8af-1aad-493d-bd7b-3a1d21f5acc2"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("a12941aa-67ed-4345-bd50-df62ce998a73"));

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "Documents",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Pdfmake",
                table: "Documents",
                type: "text",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 703, DateTimeKind.Unspecified).AddTicks(1616), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 703, DateTimeKind.Unspecified).AddTicks(1618), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("0e1a21ee-dec9-4796-b117-ca693b5bd40b"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7721), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7722), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("19d40442-b131-4e19-a175-14abeb72edff"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7703), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7704), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("7cb139a0-e6e9-48d4-a5a4-e52891051193"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7667), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7668), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("912853b3-30f6-41a1-8d38-3fbe8a7b872b"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7717), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7717), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("c6b0c850-3f1c-4151-b500-e2e5078b124d"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7694), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7694), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("e4f0db70-a1d7-433b-959c-b630beb85958"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7689), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7689), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("f1edc0ee-0d6c-4487-b63a-8f531b8e72e9"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7708), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7708), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("f34908e7-12e6-4d1b-93d9-e357bdb712ca"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7655), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7658), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("fc85ccaa-d04c-4503-953d-136c4daa79a7"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7698), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7699), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("99a7f2bc-a968-4870-aec7-c6f0474cbe75"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 716, DateTimeKind.Unspecified).AddTicks(191), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(9562), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 717, DateTimeKind.Unspecified).AddTicks(4878), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 717, DateTimeKind.Unspecified).AddTicks(4870), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 717, DateTimeKind.Unspecified).AddTicks(4882), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 717, DateTimeKind.Unspecified).AddTicks(4879), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 482, DateTimeKind.Unspecified).AddTicks(7241), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 482, DateTimeKind.Unspecified).AddTicks(7243), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$Zwm2lIS52qNwpAwhbvKEp.tH63l9Vw./ewHIcVFvDVsI0YfXZpX/i" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 592, DateTimeKind.Unspecified).AddTicks(4502), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 592, DateTimeKind.Unspecified).AddTicks(4505), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$TzoF0Q464bBRM14lXUyZN.s.WlhHgjmmgw55hNKRaNf1vdovPs5VS" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("3568b627-755a-43a7-ab42-01f9bbe55d4d"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7669), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7670), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("7cb139a0-e6e9-48d4-a5a4-e52891051193"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("69295168-ef56-415c-990d-3304f4864b0e"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7674), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7674), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("7cb139a0-e6e9-48d4-a5a4-e52891051193"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("9d860314-5b04-4e04-8d89-830884fc80cd"), new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7676), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 22, 3, 3, 32, 715, DateTimeKind.Unspecified).AddTicks(7677), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("7cb139a0-e6e9-48d4-a5a4-e52891051193"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("0e1a21ee-dec9-4796-b117-ca693b5bd40b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("19d40442-b131-4e19-a175-14abeb72edff"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("3568b627-755a-43a7-ab42-01f9bbe55d4d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("69295168-ef56-415c-990d-3304f4864b0e"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("912853b3-30f6-41a1-8d38-3fbe8a7b872b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9d860314-5b04-4e04-8d89-830884fc80cd"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c6b0c850-3f1c-4151-b500-e2e5078b124d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e4f0db70-a1d7-433b-959c-b630beb85958"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("f1edc0ee-0d6c-4487-b63a-8f531b8e72e9"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("f34908e7-12e6-4d1b-93d9-e357bdb712ca"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fc85ccaa-d04c-4503-953d-136c4daa79a7"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("99a7f2bc-a968-4870-aec7-c6f0474cbe75"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("7cb139a0-e6e9-48d4-a5a4-e52891051193"));

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "Pdfmake",
                table: "Documents");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 531, DateTimeKind.Unspecified).AddTicks(231), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 531, DateTimeKind.Unspecified).AddTicks(232), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("14daba16-b074-4c2b-b267-c4ca664e61ce"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6634), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6634), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("2cab1771-48e5-48ba-8e9d-bbc6bb4f9814"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6632), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6632), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("48b55d4e-03a5-4a82-899d-6f84f669527b"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6641), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6642), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("4efa9ce3-e7f7-4388-b4dd-993ba3cc8899"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6615), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6616), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("51b99c9c-0f5f-4edb-9348-68f443d08d2b"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6636), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6636), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("6e415a7c-3b92-4e96-8e55-6faa681c8731"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6638), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6638), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("8e5dd061-206e-49a4-8de6-c0870e7a64e5"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6649), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6649), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("a12941aa-67ed-4345-bd50-df62ce998a73"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6622), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6622), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("d17dd395-a274-474e-85d9-2e2acc9e6c2e"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6646), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6647), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("32bdd8af-1aad-493d-bd7b-3a1d21f5acc2"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(8586), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(8099), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 542, DateTimeKind.Unspecified).AddTicks(467), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 542, DateTimeKind.Unspecified).AddTicks(460), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 542, DateTimeKind.Unspecified).AddTicks(471), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 542, DateTimeKind.Unspecified).AddTicks(468), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 330, DateTimeKind.Unspecified).AddTicks(7392), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 330, DateTimeKind.Unspecified).AddTicks(7392), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$pp/qtRZGRRDzjCgVaDIMLut664TywEKwleklKZgve4vKCqP3ztxCi" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 430, DateTimeKind.Unspecified).AddTicks(2492), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 430, DateTimeKind.Unspecified).AddTicks(2494), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$HaFRdUmOxtU1PjuaAy8M5egf.xz3rw1LP2VJ9CKYLy/yQe7ms3J4m" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("2ce794c5-59c4-475d-a1cb-e74a72d706c2"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6629), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6630), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("a12941aa-67ed-4345-bd50-df62ce998a73"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("78182035-89ac-4ee3-86c9-989d3289913c"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6627), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6627), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("a12941aa-67ed-4345-bd50-df62ce998a73"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("d02ce931-0c28-433b-af39-04ccf8e9fee0"), new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6624), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 22, 2, 2, 55, 540, DateTimeKind.Unspecified).AddTicks(6624), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("a12941aa-67ed-4345-bd50-df62ce998a73"), null, "Tenants", "Tenants", "Locataires", "basic" }
                });
        }
    }
}
