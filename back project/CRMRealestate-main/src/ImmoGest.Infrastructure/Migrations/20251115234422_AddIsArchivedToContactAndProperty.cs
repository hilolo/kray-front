using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsArchivedToContactAndProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("052dbb86-3f62-49a0-b315-8e7425e3b2c8"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("0c0ac84b-78a7-4393-b59f-14ecd09f0460"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("28995777-0c2a-48ba-b30c-9098f89b0798"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("29b3845e-4ab3-4e8d-807d-86b12c6e1cf2"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("3820db6a-36b9-49b4-b731-a7d416e67aab"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4d76a992-7c4d-48f2-8efb-214eb281ea3b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("63fcaa2d-cdb3-4c2d-8f9c-20f8377c2c6d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("762bf99c-278a-45ea-b863-86bf5a033921"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("97d49b2f-cb7e-4662-b97e-d6c3a367db6a"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("cbe30617-aaf5-48f4-adcb-64c2a8818eba"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e55d552c-96e1-46b9-8100-b2febf2f4bcd"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("96780abe-4388-4906-804c-b3bd0073f274"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e4e7680c-9b23-43a4-a550-f420df75dc5d"));

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Properties",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Contacts",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Contacts");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 895, DateTimeKind.Unspecified).AddTicks(3487), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 895, DateTimeKind.Unspecified).AddTicks(3489), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("0c0ac84b-78a7-4393-b59f-14ecd09f0460"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6171), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6172), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("28995777-0c2a-48ba-b30c-9098f89b0798"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6160), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6160), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("3820db6a-36b9-49b4-b731-a7d416e67aab"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6152), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6152), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("4d76a992-7c4d-48f2-8efb-214eb281ea3b"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6155), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6155), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("63fcaa2d-cdb3-4c2d-8f9c-20f8377c2c6d"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6157), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6158), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("97d49b2f-cb7e-4662-b97e-d6c3a367db6a"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6169), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6169), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("cbe30617-aaf5-48f4-adcb-64c2a8818eba"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6149), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6149), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("e4e7680c-9b23-43a4-a550-f420df75dc5d"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6105), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6106), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("e55d552c-96e1-46b9-8100-b2febf2f4bcd"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6088), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6091), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("96780abe-4388-4906-804c-b3bd0073f274"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(8676), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(8137), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 904, DateTimeKind.Unspecified).AddTicks(9108), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 904, DateTimeKind.Unspecified).AddTicks(9103), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 904, DateTimeKind.Unspecified).AddTicks(9113), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 904, DateTimeKind.Unspecified).AddTicks(9110), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 663, DateTimeKind.Unspecified).AddTicks(7351), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 663, DateTimeKind.Unspecified).AddTicks(7354), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$CQMgyo3Py9jHFbs4d0mri.Vu1z2dReM.yxbu0e20g4JNgsJjN7E0G" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 777, DateTimeKind.Unspecified).AddTicks(4013), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 777, DateTimeKind.Unspecified).AddTicks(4015), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$sV8WMqV.LLvekf/vM/o83.oMbEoPYxMePlD2EV4kCaQrULnSGFet." });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("052dbb86-3f62-49a0-b315-8e7425e3b2c8"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6111), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6112), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("e4e7680c-9b23-43a4-a550-f420df75dc5d"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("29b3845e-4ab3-4e8d-807d-86b12c6e1cf2"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6107), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6108), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("e4e7680c-9b23-43a4-a550-f420df75dc5d"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("762bf99c-278a-45ea-b863-86bf5a033921"), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6114), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 903, DateTimeKind.Unspecified).AddTicks(6114), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("e4e7680c-9b23-43a4-a550-f420df75dc5d"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });
        }
    }
}
