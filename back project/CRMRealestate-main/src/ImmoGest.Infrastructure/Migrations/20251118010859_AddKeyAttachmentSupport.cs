using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddKeyAttachmentSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<Guid>(
                name: "DefaultAttachmentId",
                table: "Keys",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "KeyId",
                table: "Attachments",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

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

            migrationBuilder.CreateIndex(
                name: "IX_Keys_DefaultAttachmentId",
                table: "Keys",
                column: "DefaultAttachmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_KeyId",
                table: "Attachments",
                column: "KeyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Keys_KeyId",
                table: "Attachments",
                column: "KeyId",
                principalTable: "Keys",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Keys_Attachments_DefaultAttachmentId",
                table: "Keys",
                column: "DefaultAttachmentId",
                principalTable: "Attachments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Keys_KeyId",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Keys_Attachments_DefaultAttachmentId",
                table: "Keys");

            migrationBuilder.DropIndex(
                name: "IX_Keys_DefaultAttachmentId",
                table: "Keys");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_KeyId",
                table: "Attachments");

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

            migrationBuilder.DropColumn(
                name: "DefaultAttachmentId",
                table: "Keys");

            migrationBuilder.DropColumn(
                name: "KeyId",
                table: "Attachments");

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
    }
}
