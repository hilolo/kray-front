using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDocumentRemoveTransactionAndMakeCompanyIdOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop foreign key and index for TransactionId
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Transactions_TransactionId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_TransactionId",
                table: "Documents");

            // Drop TransactionId column
            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Documents");

            // Make CompanyId nullable
            migrationBuilder.AlterColumn<Guid>(
                name: "CompanyId",
                table: "Documents",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: false,
                oldCollation: "ascii_general_ci");

            // Insert seed data for default documents
            var now = DateTimeOffset.UtcNow;
            migrationBuilder.InsertData(
                table: "Documents",
                columns: new[] { "Id", "CompanyId", "CreatedOn", "Example", "Generate", "HtmlBody", "IsCachet", "IsDeleted", "IsLocked", "IsLogo", "LastModifiedOn", "Name", "Pdfmake", "SearchTerms", "Type" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-4789-a012-345678901234"), null, now, null, false, null, false, false, true, false, now, "Reservation Agreement", null, "RESERVATION AGREEMENT", 1 },
                    { new Guid("b2c3d4e5-f6a7-4890-b123-456789012345"), null, now, null, false, null, false, false, true, false, now, "Lease", null, "LEASE", 2 },
                    { new Guid("c3d4e5f6-a7b8-4901-c234-567890123456"), null, now, null, false, null, false, false, true, false, now, "Reservation Full", null, "RESERVATION FULL", 3 },
                    { new Guid("d4e5f6a7-b8c9-4012-d345-678901234567"), null, now, null, false, null, false, false, true, false, now, "Reservation Part", null, "RESERVATION PART", 4 },
                    { new Guid("e5f6a7b8-c9d0-4123-e456-789012345678"), null, now, null, false, null, false, false, true, false, now, "Fees", null, "FEES", 5 }
                });

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

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 313, DateTimeKind.Unspecified).AddTicks(3660), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 313, DateTimeKind.Unspecified).AddTicks(3661), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("0324f57b-369e-4c9a-b3af-c6096f554e17"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7951), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7952), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("101e2001-bcd1-4208-b0df-ffeda6e83bba"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7947), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7947), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("1d849446-bfc6-4d70-a122-025a157ed26b"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7921), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7922), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("2696f0f8-faa4-4eee-b5ae-4449add43f22"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7963), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7964), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("4974bbb5-05dd-4597-acd9-1b2bbd9c8d59"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7954), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7954), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("56c0311c-d6a0-448f-8058-a4ba7d5d50b7"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7936), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7937), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("94bd1794-89d4-4359-9744-8cda152c61f0"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7965), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7966), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("9f3b514b-f35a-4dac-9416-7cdfd19c25ad"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7949), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7950), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("f9303c07-2197-4ece-9fc3-92f371681de7"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7956), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7956), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("28f5ada3-ab44-471c-9ddb-7e11a55560fe"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 323, DateTimeKind.Unspecified).AddTicks(27), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(9532), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 324, DateTimeKind.Unspecified).AddTicks(1679), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 324, DateTimeKind.Unspecified).AddTicks(1673), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 324, DateTimeKind.Unspecified).AddTicks(1683), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 324, DateTimeKind.Unspecified).AddTicks(1680), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 108, DateTimeKind.Unspecified).AddTicks(1299), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 108, DateTimeKind.Unspecified).AddTicks(1300), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$.ychz4gXLq0bkSu89GC9ouFpPzXiuZmli450YbsIa6xItUFcy6dMe" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 210, DateTimeKind.Unspecified).AddTicks(4961), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 210, DateTimeKind.Unspecified).AddTicks(4962), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$pcWWSkzwmnsdx6fey4nSZO1bq5.SbB9FrPdwHCQn/BqUnjXJ0YnAG" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("2e120f85-ce53-4025-8c0b-b739be7b8463"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7942), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7943), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("56c0311c-d6a0-448f-8058-a4ba7d5d50b7"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("dd80986c-0faa-4a3d-8dfd-9ddf8271b392"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7938), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7938), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("56c0311c-d6a0-448f-8058-a4ba7d5d50b7"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("ddb7b8b4-bd1b-4507-9185-d4795f2e3b85"), new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7945), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 23, 21, 18, 36, 322, DateTimeKind.Unspecified).AddTicks(7945), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("56c0311c-d6a0-448f-8058-a4ba7d5d50b7"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("0324f57b-369e-4c9a-b3af-c6096f554e17"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("101e2001-bcd1-4208-b0df-ffeda6e83bba"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("1d849446-bfc6-4d70-a122-025a157ed26b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("2696f0f8-faa4-4eee-b5ae-4449add43f22"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("2e120f85-ce53-4025-8c0b-b739be7b8463"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4974bbb5-05dd-4597-acd9-1b2bbd9c8d59"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("94bd1794-89d4-4359-9744-8cda152c61f0"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9f3b514b-f35a-4dac-9416-7cdfd19c25ad"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("dd80986c-0faa-4a3d-8dfd-9ddf8271b392"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("ddb7b8b4-bd1b-4507-9185-d4795f2e3b85"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("f9303c07-2197-4ece-9fc3-92f371681de7"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("28f5ada3-ab44-471c-9ddb-7e11a55560fe"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("56c0311c-d6a0-448f-8058-a4ba7d5d50b7"));

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

            // Revert CompanyId to required (non-nullable)
            migrationBuilder.AlterColumn<Guid>(
                name: "CompanyId",
                table: "Documents",
                type: "char(36)",
                nullable: false,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true,
                oldCollation: "ascii_general_ci");

            // Re-add TransactionId column
            migrationBuilder.AddColumn<Guid>(
                name: "TransactionId",
                table: "Documents",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            // Re-create index and foreign key for TransactionId
            migrationBuilder.CreateIndex(
                name: "IX_Documents_TransactionId",
                table: "Documents",
                column: "TransactionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Transactions_TransactionId",
                table: "Documents",
                column: "TransactionId",
                principalTable: "Transactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Remove seed data for default documents
            migrationBuilder.DeleteData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4789-a012-345678901234"));

            migrationBuilder.DeleteData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4890-b123-456789012345"));

            migrationBuilder.DeleteData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4901-c234-567890123456"));

            migrationBuilder.DeleteData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-4012-d345-678901234567"));

            migrationBuilder.DeleteData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: new Guid("e5f6a7b8-c9d0-4123-e456-789012345678"));
        }
    }
}
