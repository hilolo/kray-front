using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeTransactionPropertyIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Properties_PropertyId",
                table: "Transactions");

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("07505c65-5e2e-417e-89e6-5e3c0138ccec"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("087e78af-a4d2-48c7-afa8-2cad9f89a9b8"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("42191b3a-4087-4106-8258-1fce9ec2b931"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("584bef71-ad19-4c5f-b807-75ed0c051938"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("6638e0d3-c7e3-41f7-9970-cb09ef8423ff"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("83521c7a-30b9-4193-bd04-2d4d130b3772"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("b0ad06b1-85b5-4443-85d1-9587ed56d076"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c4ace36e-d866-4fe8-95cd-573af0422fdb"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("cebdbcf2-55d1-437b-9719-2aa9a680e44d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e9a2c0a7-67cc-4e6e-9b4b-a4e77d5710b5"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("ef1b1233-ec6f-43cc-8ea9-9212a2908dc8"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("83510011-f11c-4c48-8076-dc54e7d99602"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"));

            migrationBuilder.AlterColumn<Guid>(
                name: "PropertyId",
                table: "Transactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)")
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 349, DateTimeKind.Unspecified).AddTicks(8953), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 349, DateTimeKind.Unspecified).AddTicks(8954), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("25794bf0-c82c-4c44-8f97-6ffd268d8100"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3613), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3614), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("35d4ed6d-47dd-4610-bc94-2bd33a26663a"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3654), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3654), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("5270acf8-9491-4370-a24f-560551e665c2"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3648), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3648), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("636d7c09-d6f9-49ed-9084-e0eeb881acb1"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3661), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3661), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("645b5c37-cba5-41d4-bdbd-77e140efd936"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3663), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3663), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("7de3cad4-5174-4ba4-beba-57ac858c79cc"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3605), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3606), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("8ae66404-8cb7-495b-a804-b5a9e88e8b86"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3644), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3644), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("c5990fad-0198-4285-a9be-86024ee35db4"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3650), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3650), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("d2b03665-d132-4f05-ac99-4e6b2dadc268"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3646), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3646), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("ebed4c67-52f0-47d8-9eef-9de0ab56d90d"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(5706), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(5231), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 359, DateTimeKind.Unspecified).AddTicks(8777), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 359, DateTimeKind.Unspecified).AddTicks(8772), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 359, DateTimeKind.Unspecified).AddTicks(8781), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 359, DateTimeKind.Unspecified).AddTicks(8778), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 143, DateTimeKind.Unspecified).AddTicks(9339), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 143, DateTimeKind.Unspecified).AddTicks(9341), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$b6Di9EdlADtpGv6UHLULqegPBtTLp5HvWdtMImcnHgMKJlEtp/6oy" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 247, DateTimeKind.Unspecified).AddTicks(2674), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 247, DateTimeKind.Unspecified).AddTicks(2676), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$en1.MNZJ2v9AuVyFs.cRPeYbZQUQ2gCRrf5KItAbPdb8lYL0KKTvq" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("29181c7f-cb58-4bf0-ac55-83d7042b744e"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3642), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3642), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("25794bf0-c82c-4c44-8f97-6ffd268d8100"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("e8d2553a-2a56-4f83-92da-82842c9e3d68"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3616), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3616), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("25794bf0-c82c-4c44-8f97-6ffd268d8100"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("f9ee5946-9243-4204-a837-051ac9683012"), new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3639), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 18, 7, 14, 38, 358, DateTimeKind.Unspecified).AddTicks(3639), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("25794bf0-c82c-4c44-8f97-6ffd268d8100"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Properties_PropertyId",
                table: "Transactions",
                column: "PropertyId",
                principalTable: "Properties",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Properties_PropertyId",
                table: "Transactions");

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("29181c7f-cb58-4bf0-ac55-83d7042b744e"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("35d4ed6d-47dd-4610-bc94-2bd33a26663a"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("5270acf8-9491-4370-a24f-560551e665c2"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("636d7c09-d6f9-49ed-9084-e0eeb881acb1"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("645b5c37-cba5-41d4-bdbd-77e140efd936"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("7de3cad4-5174-4ba4-beba-57ac858c79cc"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("8ae66404-8cb7-495b-a804-b5a9e88e8b86"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c5990fad-0198-4285-a9be-86024ee35db4"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("d2b03665-d132-4f05-ac99-4e6b2dadc268"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("e8d2553a-2a56-4f83-92da-82842c9e3d68"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("f9ee5946-9243-4204-a837-051ac9683012"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("ebed4c67-52f0-47d8-9eef-9de0ab56d90d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("25794bf0-c82c-4c44-8f97-6ffd268d8100"));

            migrationBuilder.AlterColumn<Guid>(
                name: "PropertyId",
                table: "Transactions",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true)
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 159, DateTimeKind.Unspecified).AddTicks(3838), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 159, DateTimeKind.Unspecified).AddTicks(3839), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("07505c65-5e2e-417e-89e6-5e3c0138ccec"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8200), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8200), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" },
                    { new Guid("087e78af-a4d2-48c7-afa8-2cad9f89a9b8"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8189), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8190), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("42191b3a-4087-4106-8258-1fce9ec2b931"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8176), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8176), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("584bef71-ad19-4c5f-b807-75ed0c051938"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8154), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8155), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("6638e0d3-c7e3-41f7-9970-cb09ef8423ff"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8187), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8187), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8161), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8161), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("83521c7a-30b9-4193-bd04-2d4d130b3772"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8197), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8197), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("e9a2c0a7-67cc-4e6e-9b4b-a4e77d5710b5"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8192), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8192), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("ef1b1233-ec6f-43cc-8ea9-9212a2908dc8"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8173), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8174), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("83510011-f11c-4c48-8076-dc54e7d99602"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 170, DateTimeKind.Unspecified).AddTicks(657), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 170, DateTimeKind.Unspecified).AddTicks(42), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 171, DateTimeKind.Unspecified).AddTicks(4884), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 171, DateTimeKind.Unspecified).AddTicks(4878), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 171, DateTimeKind.Unspecified).AddTicks(4888), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 171, DateTimeKind.Unspecified).AddTicks(4885), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 43, 911, DateTimeKind.Unspecified).AddTicks(4767), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 43, 911, DateTimeKind.Unspecified).AddTicks(4768), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$HDS.6ygo7eN4497AhpzD7.5ZCZZYn5T.butuROcRhmTEyeuQuPL72" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 35, DateTimeKind.Unspecified).AddTicks(4353), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 35, DateTimeKind.Unspecified).AddTicks(4357), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$E8LdKSGmztF3r8cBl.Wq9uiar18HadqUmc96xwsgfNuJzph9ElAhm" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("b0ad06b1-85b5-4443-85d1-9587ed56d076"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8163), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8163), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("c4ace36e-d866-4fe8-95cd-573af0422fdb"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8168), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8169), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("cebdbcf2-55d1-437b-9719-2aa9a680e44d"), new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8171), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 18, 6, 55, 44, 169, DateTimeKind.Unspecified).AddTicks(8171), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("77e8bac1-449e-4b08-b75e-f31abd6f2edf"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Properties_PropertyId",
                table: "Transactions",
                column: "PropertyId",
                principalTable: "Properties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
