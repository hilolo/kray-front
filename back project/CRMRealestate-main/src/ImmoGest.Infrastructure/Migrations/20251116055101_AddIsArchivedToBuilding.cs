using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsArchivedToBuilding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("058e789b-888b-44aa-b591-d2382afe46c0"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("5e022e0f-3486-470d-a476-53dcb2ad4446"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("61dc5b54-c013-429f-9be2-ad9628767dff"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("759b5c20-a223-4988-91a3-b005924fc027"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9b88862a-a3f3-4937-81cb-7dc70adb2170"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("ab60a6d0-10e7-454c-9dbd-4d8be4ff8aef"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("bd42177f-537f-4b13-8c6c-288d0e4e1950"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c771ed22-1178-4874-bc43-bc880cf49e99"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("ca559e9f-0ce5-4096-871d-92b2799d3aaa"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("d66ac2e2-7f78-4892-a0e4-6495d1350c83"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e22acce6-eae9-4f57-914d-db9abe67b212"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("ced773b2-4aed-4e7f-bf33-25ff2d5e9f6d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c2a9b679-3c76-4104-8bd0-4f7082012a58"));

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Buildings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 87, DateTimeKind.Unspecified).AddTicks(1544), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 87, DateTimeKind.Unspecified).AddTicks(1546), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("01ef4cd1-548a-4a6b-9f66-2d9b2935ddc5"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4198), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4198), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("131f7363-88a9-4592-b50f-a37ba6cc3c18"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4195), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4195), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("7d1041f8-027d-47dc-bff6-80a0f53ee89e"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4217), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4217), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("92f538cd-af9d-4223-ac5c-54767cdabb66"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4166), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4168), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("9b219ee3-ef9e-440e-91ab-22e0e364e8c9"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4180), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4180), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("9d36adec-42dc-46d8-91c1-97f511cdc730"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4192), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4193), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("c7fd6374-58ff-4a54-822b-6f8af3d062b4"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4205), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4205), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("e1fb7c9c-3082-4ba2-ba12-0589fefcf89c"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4200), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4201), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("fdbfd6fb-4b64-43fe-b25a-a0d10c9861cc"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4214), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4214), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("37517ca5-2b84-4157-b17a-53ff0592efcc"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(6865), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(6254), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 99, DateTimeKind.Unspecified).AddTicks(8748), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 99, DateTimeKind.Unspecified).AddTicks(8731), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 99, DateTimeKind.Unspecified).AddTicks(8753), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 99, DateTimeKind.Unspecified).AddTicks(8750), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 0, 858, DateTimeKind.Unspecified).AddTicks(7657), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 0, 858, DateTimeKind.Unspecified).AddTicks(7662), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$zP8tkE09Tdr51AALAWb5p.bSIE5qwQJA/wi1QcedLw4.jVZte77ta" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 0, 971, DateTimeKind.Unspecified).AddTicks(8126), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 0, 971, DateTimeKind.Unspecified).AddTicks(8130), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$U1XpDpug9ByMWJO04aOwJeTywFI/TblECGrDAC3OFhNRcKvWXbU6K" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("964e73e6-df15-4bba-bc6f-9dec7af8987b"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4182), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4182), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("9b219ee3-ef9e-440e-91ab-22e0e364e8c9"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("bc421cd3-3988-401a-8bb2-27c6cc3e2ec8"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4186), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4187), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("9b219ee3-ef9e-440e-91ab-22e0e364e8c9"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("e63d0b3e-c096-4794-a6fc-8265321b4a44"), new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4189), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 16, 5, 51, 1, 98, DateTimeKind.Unspecified).AddTicks(4190), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("9b219ee3-ef9e-440e-91ab-22e0e364e8c9"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("01ef4cd1-548a-4a6b-9f66-2d9b2935ddc5"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("131f7363-88a9-4592-b50f-a37ba6cc3c18"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("7d1041f8-027d-47dc-bff6-80a0f53ee89e"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("92f538cd-af9d-4223-ac5c-54767cdabb66"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("964e73e6-df15-4bba-bc6f-9dec7af8987b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9d36adec-42dc-46d8-91c1-97f511cdc730"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("bc421cd3-3988-401a-8bb2-27c6cc3e2ec8"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c7fd6374-58ff-4a54-822b-6f8af3d062b4"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e1fb7c9c-3082-4ba2-ba12-0589fefcf89c"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e63d0b3e-c096-4794-a6fc-8265321b4a44"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fdbfd6fb-4b64-43fe-b25a-a0d10c9861cc"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("37517ca5-2b84-4157-b17a-53ff0592efcc"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9b219ee3-ef9e-440e-91ab-22e0e364e8c9"));

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Buildings");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 513, DateTimeKind.Unspecified).AddTicks(73), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 513, DateTimeKind.Unspecified).AddTicks(78), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("5e022e0f-3486-470d-a476-53dcb2ad4446"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7906), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7906), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("61dc5b54-c013-429f-9be2-ad9628767dff"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7901), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7902), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("9b88862a-a3f3-4937-81cb-7dc70adb2170"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7904), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7904), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("ab60a6d0-10e7-454c-9dbd-4d8be4ff8aef"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7913), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7913), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("bd42177f-537f-4b13-8c6c-288d0e4e1950"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7897), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7897), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("c2a9b679-3c76-4104-8bd0-4f7082012a58"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7872), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7872), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("c771ed22-1178-4874-bc43-bc880cf49e99"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7917), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7918), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("ca559e9f-0ce5-4096-871d-92b2799d3aaa"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7899), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7899), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("d66ac2e2-7f78-4892-a0e4-6495d1350c83"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7865), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7866), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("ced773b2-4aed-4e7f-bf33-25ff2d5e9f6d"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 521, DateTimeKind.Unspecified).AddTicks(378), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(9826), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 522, DateTimeKind.Unspecified).AddTicks(198), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 522, DateTimeKind.Unspecified).AddTicks(193), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 522, DateTimeKind.Unspecified).AddTicks(203), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 522, DateTimeKind.Unspecified).AddTicks(199), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 292, DateTimeKind.Unspecified).AddTicks(7503), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 292, DateTimeKind.Unspecified).AddTicks(7504), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$7clBQEavKf6LXiumKasn6umoKsHcuLYECfj//FDcAoGSe3TuKB.by" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 401, DateTimeKind.Unspecified).AddTicks(5629), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 401, DateTimeKind.Unspecified).AddTicks(5632), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$PNrvlLbDrxMAn8lK2S3Ru.qjwmslGyiMPeY7/rTXL6LrET52gUZNS" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("058e789b-888b-44aa-b591-d2382afe46c0"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7891), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7891), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("c2a9b679-3c76-4104-8bd0-4f7082012a58"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("759b5c20-a223-4988-91a3-b005924fc027"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7874), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7874), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("c2a9b679-3c76-4104-8bd0-4f7082012a58"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("e22acce6-eae9-4f57-914d-db9abe67b212"), new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7894), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 15, 23, 44, 21, 520, DateTimeKind.Unspecified).AddTicks(7894), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("c2a9b679-3c76-4104-8bd0-4f7082012a58"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });
        }
    }
}
