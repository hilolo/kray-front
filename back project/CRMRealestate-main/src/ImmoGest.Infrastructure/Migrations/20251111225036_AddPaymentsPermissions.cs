using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentsPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("04688d37-ad55-422a-bf78-4c11570d4e03"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("0857e656-0c30-419d-985b-a1f45346e7a0"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("1237ccca-9d4c-4b02-9708-fc5c5b125e69"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("174e9bc7-04f3-4ef4-810e-a582a49d2d96"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4230d891-8147-4b37-99e1-4c4d531e412c"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("56083363-342b-4f42-b37a-2b28e6e1bc8c"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("5c9e4eba-5b43-4a4a-95ee-aea23f56de18"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("81376e47-1d0a-468f-b8d2-628563e08304"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b18b2336-a504-4041-acb4-c754ce6b0b88"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b89f4253-5bcd-4083-b346-a504f9208b23"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("cad9df6f-c1ef-42b8-88f2-4f10df077a9f"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("adf1c591-0006-4c2c-b494-15340ec207c6"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("a87425ca-7b8c-4315-801f-999eed64f607"));

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 765, DateTimeKind.Unspecified).AddTicks(283), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 765, DateTimeKind.Unspecified).AddTicks(286), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("077403bd-b372-41d3-9eb4-532ac562e7a5"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8178), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8178), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("07e96313-2a19-4208-89d5-2e1189e1ddd7"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8190), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8190), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("19fb3900-15c2-45de-93a9-539937bb55f6"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8176), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8176), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("298f9974-aed2-476e-9a85-d922de66c5d9"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8180), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8181), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("4bb0d42d-3ab1-440f-b724-f55b4a898601"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8160), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8160), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("4bff5b52-345a-46b8-a3e2-0797f6100e13"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8187), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8187), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("5e8c867a-c8f3-45c5-87e7-23e0979a9beb"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8171), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8171), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("8f01b766-a828-410c-a2b6-5344167d0509"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8142), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8143), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("b28514cc-ec2e-40f1-b8be-2e222a449c9e"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8173), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8174), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "Language", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("894b6952-5b09-4cd6-b80b-0ea42a033bd4"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 773, DateTimeKind.Unspecified).AddTicks(464), new TimeSpan(0, 0, 0, 0, 0)), "New York", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", "fr", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(9925), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "PermissionsJson" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 774, DateTimeKind.Unspecified).AddTicks(518), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 774, DateTimeKind.Unspecified).AddTicks(512), new TimeSpan(0, 0, 0, 0, 0)), "{\r\n                        \"dashboard\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"properties\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"buildings\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"leasing\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"reservations\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"maintenance\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"contacts\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"keys\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"banks\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"payments\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"file-manager\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"reports\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"settings\": {\"view\": true, \"edit\": true, \"delete\": true}\r\n                    }" });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "PermissionsJson" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 774, DateTimeKind.Unspecified).AddTicks(523), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 774, DateTimeKind.Unspecified).AddTicks(520), new TimeSpan(0, 0, 0, 0, 0)), "{\r\n                        \"dashboard\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"properties\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"buildings\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"leasing\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"reservations\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"maintenance\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"contacts\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"keys\": {\"view\": false, \"edit\": false, \"delete\": false},\r\n                        \"banks\": {\"view\": false, \"edit\": false, \"delete\": false},\r\n                        \"payments\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"file-manager\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"reports\": {\"view\": false, \"edit\": false, \"delete\": false},\r\n                        \"settings\": {\"view\": false, \"edit\": false, \"delete\": false}\r\n                    }" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 544, DateTimeKind.Unspecified).AddTicks(4710), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 544, DateTimeKind.Unspecified).AddTicks(4711), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$cQc.VOiDrF0mpth8yljOkuHNYUVjfKbUoq9aBxD8Lp6u2rWh2ITSu" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 653, DateTimeKind.Unspecified).AddTicks(574), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 653, DateTimeKind.Unspecified).AddTicks(577), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$dnYOrmPj7TtqlORbHWHToefdyagUIGUCPm509yktriz6.4lgCElgu" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("23c0b489-860d-4fed-8337-b1a1d54542ff"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8168), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8169), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("4bb0d42d-3ab1-440f-b724-f55b4a898601"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("a37ac3a3-24ab-4ca9-a104-2330f48be3d9"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8162), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8162), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("4bb0d42d-3ab1-440f-b724-f55b4a898601"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("dd05e168-3b1c-4b82-89fc-0fb8c5f2e892"), new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8166), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 11, 22, 50, 35, 772, DateTimeKind.Unspecified).AddTicks(8166), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("4bb0d42d-3ab1-440f-b724-f55b4a898601"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("077403bd-b372-41d3-9eb4-532ac562e7a5"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("07e96313-2a19-4208-89d5-2e1189e1ddd7"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("19fb3900-15c2-45de-93a9-539937bb55f6"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("23c0b489-860d-4fed-8337-b1a1d54542ff"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("298f9974-aed2-476e-9a85-d922de66c5d9"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4bff5b52-345a-46b8-a3e2-0797f6100e13"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("5e8c867a-c8f3-45c5-87e7-23e0979a9beb"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("8f01b766-a828-410c-a2b6-5344167d0509"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("a37ac3a3-24ab-4ca9-a104-2330f48be3d9"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b28514cc-ec2e-40f1-b8be-2e222a449c9e"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("dd05e168-3b1c-4b82-89fc-0fb8c5f2e892"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("894b6952-5b09-4cd6-b80b-0ea42a033bd4"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4bb0d42d-3ab1-440f-b724-f55b4a898601"));

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 497, DateTimeKind.Unspecified).AddTicks(1445), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 497, DateTimeKind.Unspecified).AddTicks(1446), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("04688d37-ad55-422a-bf78-4c11570d4e03"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2313), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2313), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("0857e656-0c30-419d-985b-a1f45346e7a0"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2297), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2297), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("1237ccca-9d4c-4b02-9708-fc5c5b125e69"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2278), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2280), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("174e9bc7-04f3-4ef4-810e-a582a49d2d96"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2306), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2307), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("4230d891-8147-4b37-99e1-4c4d531e412c"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2301), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2301), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("81376e47-1d0a-468f-b8d2-628563e08304"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2315), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2315), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("a87425ca-7b8c-4315-801f-999eed64f607"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2287), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2288), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("b18b2336-a504-4041-acb4-c754ce6b0b88"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2299), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2299), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("b89f4253-5bcd-4083-b346-a504f9208b23"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2303), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2303), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "Language", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("adf1c591-0006-4c2c-b494-15340ec207c6"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(4299), new TimeSpan(0, 0, 0, 0, 0)), "New York", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", "fr", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(3870), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "PermissionsJson" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 505, DateTimeKind.Unspecified).AddTicks(3985), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 505, DateTimeKind.Unspecified).AddTicks(3979), new TimeSpan(0, 0, 0, 0, 0)), "{\r\n                        \"dashboard\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"properties\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"buildings\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"leasing\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"reservations\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"maintenance\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"contacts\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"keys\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"banks\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"file-manager\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"reports\": {\"view\": true, \"edit\": true, \"delete\": true},\r\n                        \"settings\": {\"view\": true, \"edit\": true, \"delete\": true}\r\n                    }" });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "PermissionsJson" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 505, DateTimeKind.Unspecified).AddTicks(3989), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 505, DateTimeKind.Unspecified).AddTicks(3985), new TimeSpan(0, 0, 0, 0, 0)), "{\r\n                        \"dashboard\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"properties\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"buildings\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"leasing\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"reservations\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"maintenance\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"contacts\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"keys\": {\"view\": false, \"edit\": false, \"delete\": false},\r\n                        \"banks\": {\"view\": false, \"edit\": false, \"delete\": false},\r\n                        \"file-manager\": {\"view\": true, \"edit\": false, \"delete\": false},\r\n                        \"reports\": {\"view\": false, \"edit\": false, \"delete\": false},\r\n                        \"settings\": {\"view\": false, \"edit\": false, \"delete\": false}\r\n                    }" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 292, DateTimeKind.Unspecified).AddTicks(6567), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 292, DateTimeKind.Unspecified).AddTicks(6569), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$o6hQJj6dP3EPfPaTcuwdEewhuLTHrQADTfbKkE0cKOozlSWEtRHQK" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 394, DateTimeKind.Unspecified).AddTicks(8102), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 394, DateTimeKind.Unspecified).AddTicks(8104), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$paHxRnexH/6GHQeAhw/cAe/SEg0W6lQ3QlAtmKZqdSqUW8700hsGS" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("56083363-342b-4f42-b37a-2b28e6e1bc8c"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2294), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2295), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("a87425ca-7b8c-4315-801f-999eed64f607"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("5c9e4eba-5b43-4a4a-95ee-aea23f56de18"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2292), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2292), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("a87425ca-7b8c-4315-801f-999eed64f607"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("cad9df6f-c1ef-42b8-88f2-4f10df077a9f"), new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2289), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 11, 20, 17, 11, 504, DateTimeKind.Unspecified).AddTicks(2290), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("a87425ca-7b8c-4315-801f-999eed64f607"), null, "Tenants", "Tenants", "Locataires", "basic" }
                });
        }
    }
}
