using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsReservationShowToProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("0621ff2a-37e6-47be-be2e-466789686cfa"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("0669fcc1-6d1b-4e1c-9d4e-121f825b5391"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("266771cc-9ae2-476d-8c85-f7b2c3ae9942"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("3adf8266-0e22-45d1-8fb2-e2e58f6f63c9"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4f0e4c8e-87c2-4ae1-a85a-d65a74685a34"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("8371113d-4b9d-4823-8f29-16018642f1ee"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("83797bde-c64d-4b2a-8177-1a77955e42e7"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9212ab38-575e-4c8d-b221-f853e63afa61"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("99271368-3dbd-4465-be2d-215c1267e7d4"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9b9622af-fb48-426f-9783-6f5e08af8393"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b6202900-b693-4668-8704-ab2197e96532"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("d0fede36-06e6-47da-a840-f8ee53527790"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("df43c58a-0f2e-41ab-b819-2929c0fb9185"));

            migrationBuilder.RenameColumn(
                name: "IsShared",
                table: "Properties",
                newName: "IsReservationShow");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 890, DateTimeKind.Unspecified).AddTicks(6768), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 890, DateTimeKind.Unspecified).AddTicks(6772), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("26b757ed-5757-45e5-aa97-b8facf9c8f6a"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8939), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8939), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("2990ced9-0a28-4ff7-a97e-d1ae18c4a5ad"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8949), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8949), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("34c5252d-5944-4cbb-bddf-bdd733ac222a"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8944), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8944), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("3e3daeb1-a90d-4a46-a027-90b578bca655"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8957), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8957), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("504c84e9-2598-4a58-960b-b86d1ff1c7e3"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8927), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8927), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("6625376f-c3ca-45f0-a807-0da052ae1609"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8941), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8942), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("78e0ca0b-d234-4eaf-acef-824e5d43dc9b"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8910), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8912), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("83539b60-53e4-4097-b210-558db2ffe912"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8946), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8947), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("fae6d2da-9a6f-4544-a91e-f7e0b7472711"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8959), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8960), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("9bd80c94-9e30-43d4-b31f-e4bb300b5eec"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 899, DateTimeKind.Unspecified).AddTicks(1228), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 899, DateTimeKind.Unspecified).AddTicks(741), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 900, DateTimeKind.Unspecified).AddTicks(2417), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 900, DateTimeKind.Unspecified).AddTicks(2411), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 900, DateTimeKind.Unspecified).AddTicks(2422), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 900, DateTimeKind.Unspecified).AddTicks(2418), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 663, DateTimeKind.Unspecified).AddTicks(1994), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 663, DateTimeKind.Unspecified).AddTicks(1996), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$K.pnl8AStJmMiLxf8LfH1O3ksZFR6dSbTuhDYqql3B.jvmdetKLGW" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 776, DateTimeKind.Unspecified).AddTicks(2738), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 776, DateTimeKind.Unspecified).AddTicks(2740), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$nQ/bHSOf5ITBQ2w4lV8X3OOq/ApFIwFadOyeTMlz0ylfh7KaP4vwm" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("151dcd0e-50f2-4b05-9bf3-d4a076a509da"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8929), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8929), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("504c84e9-2598-4a58-960b-b86d1ff1c7e3"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("68e14486-cac7-4eb1-8865-fee5cdaca8f3"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8934), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8934), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("504c84e9-2598-4a58-960b-b86d1ff1c7e3"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("7a14ef6f-8665-4d22-b1a2-79eab6c335cb"), new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8936), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 16, 23, 42, 45, 898, DateTimeKind.Unspecified).AddTicks(8937), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("504c84e9-2598-4a58-960b-b86d1ff1c7e3"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("151dcd0e-50f2-4b05-9bf3-d4a076a509da"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("26b757ed-5757-45e5-aa97-b8facf9c8f6a"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("2990ced9-0a28-4ff7-a97e-d1ae18c4a5ad"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("34c5252d-5944-4cbb-bddf-bdd733ac222a"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("3e3daeb1-a90d-4a46-a027-90b578bca655"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("6625376f-c3ca-45f0-a807-0da052ae1609"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("68e14486-cac7-4eb1-8865-fee5cdaca8f3"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("78e0ca0b-d234-4eaf-acef-824e5d43dc9b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("7a14ef6f-8665-4d22-b1a2-79eab6c335cb"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("83539b60-53e4-4097-b210-558db2ffe912"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fae6d2da-9a6f-4544-a91e-f7e0b7472711"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("9bd80c94-9e30-43d4-b31f-e4bb300b5eec"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("504c84e9-2598-4a58-960b-b86d1ff1c7e3"));

            migrationBuilder.RenameColumn(
                name: "IsReservationShow",
                table: "Properties",
                newName: "IsShared");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 883, DateTimeKind.Unspecified).AddTicks(7828), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 883, DateTimeKind.Unspecified).AddTicks(7831), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("0669fcc1-6d1b-4e1c-9d4e-121f825b5391"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8875), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8875), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("266771cc-9ae2-476d-8c85-f7b2c3ae9942"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8892), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8892), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("3adf8266-0e22-45d1-8fb2-e2e58f6f63c9"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8903), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8904), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("4f0e4c8e-87c2-4ae1-a85a-d65a74685a34"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8889), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8889), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("8371113d-4b9d-4823-8f29-16018642f1ee"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8894), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8894), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("83797bde-c64d-4b2a-8177-1a77955e42e7"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8901), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8901), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("99271368-3dbd-4465-be2d-215c1267e7d4"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8856), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8856), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("9b9622af-fb48-426f-9783-6f5e08af8393"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8887), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8887), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("df43c58a-0f2e-41ab-b819-2929c0fb9185"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8863), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8864), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("d0fede36-06e6-47da-a840-f8ee53527790"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 893, DateTimeKind.Unspecified).AddTicks(1360), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 893, DateTimeKind.Unspecified).AddTicks(746), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 894, DateTimeKind.Unspecified).AddTicks(2553), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 894, DateTimeKind.Unspecified).AddTicks(2545), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 894, DateTimeKind.Unspecified).AddTicks(2556), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 894, DateTimeKind.Unspecified).AddTicks(2554), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 647, DateTimeKind.Unspecified).AddTicks(6585), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 647, DateTimeKind.Unspecified).AddTicks(6587), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$ClOfWUidHZKrmuMeFyVcD.IEz3FcEnyRWzqXg6peQx5ApvHqNlN92" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 767, DateTimeKind.Unspecified).AddTicks(4457), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 767, DateTimeKind.Unspecified).AddTicks(4462), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$cJ7MatsqYDwsxyVkT4Wq3.Ukt6aDoafgBEJLcP0jf0L5pjhb4RU6." });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("0621ff2a-37e6-47be-be2e-466789686cfa"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8872), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8872), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("df43c58a-0f2e-41ab-b819-2929c0fb9185"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("9212ab38-575e-4c8d-b221-f853e63afa61"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8865), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8866), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("df43c58a-0f2e-41ab-b819-2929c0fb9185"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("b6202900-b693-4668-8704-ab2197e96532"), new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8869), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 16, 20, 6, 9, 892, DateTimeKind.Unspecified).AddTicks(8870), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("df43c58a-0f2e-41ab-b819-2929c0fb9185"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });
        }
    }
}
