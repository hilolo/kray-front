using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNameToDocumentAndUpdateDocumentType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("0e50a5c6-3327-470c-a33d-86bb2898f23b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("10df1ea7-c9bf-443e-887f-d053d27cb310"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("163bd33f-0ee3-485c-a5c1-08930f4d1f37"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("28202a8c-1f22-4f02-9ec2-eaa7261e8c20"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("34c20e4e-19cc-4872-96cd-9a89a639f39b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4673366a-48d0-47ae-98af-b981da7a5715"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4c6f93da-c62e-4dbd-b57d-e12f56a41240"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4d10d43c-f0a8-419d-8abb-08f398a800fe"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9bc713c3-995d-488c-b5a5-34bbbbe07f37"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e29988e7-6625-40e4-9ab6-d37e1d405cc0"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fa084a6d-54d9-44d2-bdb2-6b7982fb9f41"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("0f4a0360-ead1-4eb2-8d92-3641d6ac739c"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"));

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Documents",
                type: "varchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 128, DateTimeKind.Unspecified).AddTicks(5992), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 128, DateTimeKind.Unspecified).AddTicks(5996), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("086deb43-183f-4506-ab95-73b141bfcb8e"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9951), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9951), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("16c906fb-7928-484b-917c-d8135538f166"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9968), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9968), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("65c36bc8-249b-4ada-9df6-e536323842fd"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9946), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9946), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("7b2d0836-770c-4924-b3c0-cea8b3038505"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9965), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9965), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("80d2d50f-e6df-4a72-bf65-5dca1fe41bce"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9921), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9922), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("9bb296b6-bd98-486c-a142-06f2775300ea"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9956), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9956), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("ce2ac84c-cb58-453b-9506-3426702fe75f"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9943), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9944), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("faa50496-73d5-4fd9-a641-d8bea23ed2f2"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9931), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9931), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("fee49e47-4bc8-429a-a0e5-d7454c67d3b1"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9948), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9949), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("eb5c9320-2be9-4e95-968c-6d2c906a0f22"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 138, DateTimeKind.Unspecified).AddTicks(2369), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 138, DateTimeKind.Unspecified).AddTicks(1788), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 139, DateTimeKind.Unspecified).AddTicks(5627), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 139, DateTimeKind.Unspecified).AddTicks(5620), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 139, DateTimeKind.Unspecified).AddTicks(5632), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 139, DateTimeKind.Unspecified).AddTicks(5629), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 10, 911, DateTimeKind.Unspecified).AddTicks(6804), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 10, 911, DateTimeKind.Unspecified).AddTicks(6805), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$lNaUT.L5/JU0Yp041qutpOVksIAVaSb6Bpl5sYXczzlt/nlIOjJ.y" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 15, DateTimeKind.Unspecified).AddTicks(5589), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 15, DateTimeKind.Unspecified).AddTicks(5598), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$Rn2Wz9UE6EWetB5Af0g3uORDnTx5mBebTOXfNVSpcllJFYnhXFUGm" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("04d7de0e-1e63-4a86-8d61-76f512a7c116"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9933), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9933), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("faa50496-73d5-4fd9-a641-d8bea23ed2f2"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("5203d945-76fa-4589-a6b8-1e8888f2de17"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9940), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9941), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("faa50496-73d5-4fd9-a641-d8bea23ed2f2"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("8b050a34-9f2b-4c9d-a254-faf57707ea2e"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9937), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 54, 11, 137, DateTimeKind.Unspecified).AddTicks(9938), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("faa50496-73d5-4fd9-a641-d8bea23ed2f2"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("04d7de0e-1e63-4a86-8d61-76f512a7c116"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("086deb43-183f-4506-ab95-73b141bfcb8e"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("16c906fb-7928-484b-917c-d8135538f166"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("5203d945-76fa-4589-a6b8-1e8888f2de17"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("65c36bc8-249b-4ada-9df6-e536323842fd"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("7b2d0836-770c-4924-b3c0-cea8b3038505"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("80d2d50f-e6df-4a72-bf65-5dca1fe41bce"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("8b050a34-9f2b-4c9d-a254-faf57707ea2e"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("9bb296b6-bd98-486c-a142-06f2775300ea"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("ce2ac84c-cb58-453b-9506-3426702fe75f"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fee49e47-4bc8-429a-a0e5-d7454c67d3b1"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("eb5c9320-2be9-4e95-968c-6d2c906a0f22"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("faa50496-73d5-4fd9-a641-d8bea23ed2f2"));

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Documents");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 28, DateTimeKind.Unspecified).AddTicks(5390), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 28, DateTimeKind.Unspecified).AddTicks(5391), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("0e50a5c6-3327-470c-a33d-86bb2898f23b"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8971), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8971), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("10df1ea7-c9bf-443e-887f-d053d27cb310"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8952), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8953), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("28202a8c-1f22-4f02-9ec2-eaa7261e8c20"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8973), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8973), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("34c20e4e-19cc-4872-96cd-9a89a639f39b"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8995), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8996), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("4673366a-48d0-47ae-98af-b981da7a5715"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8975), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8976), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("4c6f93da-c62e-4dbd-b57d-e12f56a41240"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(9000), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(9000), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8959), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8960), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("9bc713c3-995d-488c-b5a5-34bbbbe07f37"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8993), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8993), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("e29988e7-6625-40e4-9ab6-d37e1d405cc0"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(9002), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(9003), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("0f4a0360-ead1-4eb2-8d92-3641d6ac739c"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 39, DateTimeKind.Unspecified).AddTicks(1315), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 39, DateTimeKind.Unspecified).AddTicks(737), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 40, DateTimeKind.Unspecified).AddTicks(5418), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 40, DateTimeKind.Unspecified).AddTicks(5410), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 40, DateTimeKind.Unspecified).AddTicks(5422), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 40, DateTimeKind.Unspecified).AddTicks(5419), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 37, 808, DateTimeKind.Unspecified).AddTicks(3593), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 37, 808, DateTimeKind.Unspecified).AddTicks(3594), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$Xd6laBTXEA99Q.CvHEXy/uOTZOILeGhBedT8vpwqsZrBQWKP0cVaW" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 37, 918, DateTimeKind.Unspecified).AddTicks(6701), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 37, 918, DateTimeKind.Unspecified).AddTicks(6704), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$l2gc.Uw7qPFW7kcmQm3sXuYdBgZA8DkPQpykKKyo3bSfWklYL3fQm" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("163bd33f-0ee3-485c-a5c1-08930f4d1f37"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8966), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8966), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("4d10d43c-f0a8-419d-8abb-08f398a800fe"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8968), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8969), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("fa084a6d-54d9-44d2-bdb2-6b7982fb9f41"), new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8961), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 22, 1, 45, 38, 38, DateTimeKind.Unspecified).AddTicks(8962), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("5273a02a-86a3-4696-a02c-187f87e7d241"), null, "Tenants", "Tenants", "Locataires", "basic" }
                });
        }
    }
}
