using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLanguageFromSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropColumn(
                name: "Language",
                table: "Settings");

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
                columns: new[] { "CreatedOn", "LastModifiedOn", "PermissionsJson" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 904, DateTimeKind.Unspecified).AddTicks(9108), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 904, DateTimeKind.Unspecified).AddTicks(9103), new TimeSpan(0, 0, 0, 0, 0)), "{\n                        \"dashboard\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"properties\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"buildings\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"leasing\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"reservations\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"maintenance\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"contacts\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"keys\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"banks\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"payments\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"file-manager\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"reports\": {\"view\": true, \"edit\": true, \"delete\": true},\n                        \"settings\": {\"view\": true, \"edit\": true, \"delete\": true}\n                    }" });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "PermissionsJson" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 904, DateTimeKind.Unspecified).AddTicks(9113), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 15, 5, 5, 57, 904, DateTimeKind.Unspecified).AddTicks(9110), new TimeSpan(0, 0, 0, 0, 0)), "{\n                        \"dashboard\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"properties\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"buildings\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"leasing\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"reservations\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"maintenance\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"contacts\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"keys\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"banks\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"payments\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"file-manager\": {\"view\": true, \"edit\": false, \"delete\": false},\n                        \"reports\": {\"view\": false, \"edit\": false, \"delete\": false},\n                        \"settings\": {\"view\": false, \"edit\": false, \"delete\": false}\n                    }" });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "Settings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

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
    }
}
