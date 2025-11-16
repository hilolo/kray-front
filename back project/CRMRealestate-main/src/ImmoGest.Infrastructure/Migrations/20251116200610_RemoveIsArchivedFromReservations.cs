using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIsArchivedFromReservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Reservations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Reservations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
