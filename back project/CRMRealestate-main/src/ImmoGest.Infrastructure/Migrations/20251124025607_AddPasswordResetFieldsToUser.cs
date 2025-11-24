using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetFieldsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("37f5b3e7-23cf-4f4c-bcb7-3ea84ff04579"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("62e4ff4a-54b7-4f66-8553-f1247de76cfd"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9288bb4c-3501-4367-8841-bc52f8d284ab"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("92bc6cf6-cee8-4e8a-816c-b5166c7ee0ea"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("a4fe101a-ba79-4f0a-9d56-f53e75dadde3"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("aaf11c98-a42d-4e01-80a2-c2a7dc74585f"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b767527a-ed57-42b2-b7f2-80dc206d47f0"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c3eaab17-be91-4efd-b917-c687ff384b03"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e190e097-2f98-4312-88bb-2b1658bfa096"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e359042e-d227-4eea-becf-db806021caae"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fdc17946-ce74-4461-883e-b4a7d05a0db9"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("5a9d2a9d-999d-4317-b50a-d5bb27673c66"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("99441ff5-ba96-4360-919c-f66eb5d438c1"));

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetToken",
                table: "Users",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiry",
                table: "Users",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 90, DateTimeKind.Unspecified).AddTicks(3250), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 90, DateTimeKind.Unspecified).AddTicks(3252), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4890-b123-456789012345"),
                columns: new[] { "CreatedOn", "Example", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)), "{\"companyWebsite\":\"https://www.kray.ma\",\"PropertyOwnerName\":\"Mehdi\",\"TenantName\":\"Ahmed\",\"TenantRefrence\":\"K555555\",\"PropertyAdresse\":\"Souani 4 Imb A51 N 51\",\"PropertyRefrence\":\"ALL51595\",\"TransactionTotalPrice\":\"2500\",\"TransactionDate\":\"10/10/2025\",\"TransactionDateMonhYear\":\"Janvier 2025\"}", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4901-c234-567890123456"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-4012-d345-678901234567"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("e5f6a7b8-c9d0-4123-e456-789012345678"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("f6a7b8c9-d0e1-4234-f567-890123456789"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 106, DateTimeKind.Unspecified).AddTicks(5484), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("1294ebbf-0ab0-4a5b-a586-68555d2c5f5d"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(952), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(952), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("3ab8007f-6cd4-46bc-84dc-5a8b093066e8"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(935), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(936), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("4c247350-62f9-456b-9567-aaf6924d1beb"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(904), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(904), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("53c02bfe-e711-44b7-9538-78d3f9c77de8"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(945), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(945), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("64775c70-3d0b-4674-8331-5ab97d669caa"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(914), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(915), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("7487de02-d524-402b-ab48-ec7c96584cbd"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(938), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(938), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("d4acc5ca-6065-4fb0-aad0-0df112561e66"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(947), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(948), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("f1fc0dad-aa16-4f65-a942-0c01259191b9"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(942), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(943), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("fae0d48d-6082-4366-b58e-2eae760767e2"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(940), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(940), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("c47bd84c-dd8e-46dc-9fb2-27caa3032171"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(3334), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(2724), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 103, DateTimeKind.Unspecified).AddTicks(7383), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 103, DateTimeKind.Unspecified).AddTicks(7377), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 103, DateTimeKind.Unspecified).AddTicks(7388), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 103, DateTimeKind.Unspecified).AddTicks(7385), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 5, 857, DateTimeKind.Unspecified).AddTicks(6474), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 5, 857, DateTimeKind.Unspecified).AddTicks(6475), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$sEOhq/UThjlnFXZxuSFNp.HAX4eFt3uA2TYixuQp36w2M8e38nxBG", null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 5, 974, DateTimeKind.Unspecified).AddTicks(1762), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 5, 974, DateTimeKind.Unspecified).AddTicks(1766), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$/RqCmeL20PLoS85meJ7kp.dulywg2HadtiadCIEpEfgr.FnbjWWvW", null, null });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("058d38ed-32f5-441e-a356-24028a6c95fe"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(916), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(917), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("64775c70-3d0b-4674-8331-5ab97d669caa"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("32df9ae8-cb6d-4084-8e46-b95e9695af9d"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(933), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(933), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("64775c70-3d0b-4674-8331-5ab97d669caa"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("44d2d722-1490-4819-bc16-59c0b8ebec55"), new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(930), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 24, 2, 56, 6, 102, DateTimeKind.Unspecified).AddTicks(930), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("64775c70-3d0b-4674-8331-5ab97d669caa"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("058d38ed-32f5-441e-a356-24028a6c95fe"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("1294ebbf-0ab0-4a5b-a586-68555d2c5f5d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("32df9ae8-cb6d-4084-8e46-b95e9695af9d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("3ab8007f-6cd4-46bc-84dc-5a8b093066e8"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("44d2d722-1490-4819-bc16-59c0b8ebec55"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4c247350-62f9-456b-9567-aaf6924d1beb"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("53c02bfe-e711-44b7-9538-78d3f9c77de8"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("7487de02-d524-402b-ab48-ec7c96584cbd"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("d4acc5ca-6065-4fb0-aad0-0df112561e66"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("f1fc0dad-aa16-4f65-a942-0c01259191b9"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fae0d48d-6082-4366-b58e-2eae760767e2"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("c47bd84c-dd8e-46dc-9fb2-27caa3032171"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("64775c70-3d0b-4674-8331-5ab97d669caa"));

            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiry",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 952, DateTimeKind.Unspecified).AddTicks(3200), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 952, DateTimeKind.Unspecified).AddTicks(3201), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4890-b123-456789012345"),
                columns: new[] { "CreatedOn", "Example", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)), null, new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4901-c234-567890123456"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-4012-d345-678901234567"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("e5f6a7b8-c9d0-4123-e456-789012345678"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("f6a7b8c9-d0e1-4234-f567-890123456789"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 965, DateTimeKind.Unspecified).AddTicks(5317), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("37f5b3e7-23cf-4f4c-bcb7-3ea84ff04579"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8282), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8282), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("62e4ff4a-54b7-4f66-8553-f1247de76cfd"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8278), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8278), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("9288bb4c-3501-4367-8841-bc52f8d284ab"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8248), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8249), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("92bc6cf6-cee8-4e8a-816c-b5166c7ee0ea"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8288), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8289), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("99441ff5-ba96-4360-919c-f66eb5d438c1"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8258), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8258), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("a4fe101a-ba79-4f0a-9d56-f53e75dadde3"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8280), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8280), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("aaf11c98-a42d-4e01-80a2-c2a7dc74585f"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8284), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8285), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("c3eaab17-be91-4efd-b917-c687ff384b03"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8286), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8287), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("fdc17946-ce74-4461-883e-b4a7d05a0db9"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8290), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8291), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("5a9d2a9d-999d-4317-b50a-d5bb27673c66"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 962, DateTimeKind.Unspecified).AddTicks(405), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(9838), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 963, DateTimeKind.Unspecified).AddTicks(2234), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 963, DateTimeKind.Unspecified).AddTicks(2227), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 963, DateTimeKind.Unspecified).AddTicks(2241), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 963, DateTimeKind.Unspecified).AddTicks(2235), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 742, DateTimeKind.Unspecified).AddTicks(8343), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 742, DateTimeKind.Unspecified).AddTicks(8345), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$11gEHfSIKnIAJpGAxKegTusOkuBcE10i.A0EotxTodKD6x./iSKF2" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 848, DateTimeKind.Unspecified).AddTicks(572), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 848, DateTimeKind.Unspecified).AddTicks(573), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$Bo1zCTYPOF/CYudIde3wBu7truePvOzVcnB4nOAHN4/8g9o1.ZNV6" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("b767527a-ed57-42b2-b7f2-80dc206d47f0"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8260), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8260), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("99441ff5-ba96-4360-919c-f66eb5d438c1"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("e190e097-2f98-4312-88bb-2b1658bfa096"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8275), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8276), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("99441ff5-ba96-4360-919c-f66eb5d438c1"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("e359042e-d227-4eea-becf-db806021caae"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8265), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 40, 49, 961, DateTimeKind.Unspecified).AddTicks(8266), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("99441ff5-ba96-4360-919c-f66eb5d438c1"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });
        }
    }
}
