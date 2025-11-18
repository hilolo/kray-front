using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepositPriceToTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("3bc9ea05-fbf9-4267-ae75-0e00f641639c"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("3cdbc37b-6453-41d6-ae12-6560ea1ed3ac"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("44f213ba-a62b-4667-883c-6567ce45d61b"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4fdcea05-0d1b-4de5-ab2a-c9d13201287d"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("522ddc70-62fe-4013-b0c4-1932482fd0e0"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("5d797ac7-e563-4f46-8b99-2407d300e005"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("77f07ae3-4dc4-4c9a-ad9b-eac15438b287"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("92153c46-5264-4067-936f-dcb65fe0decb"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c6e1d9a8-894d-4ca2-85a4-3bc9cdaa9e92"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c93b4721-4a3d-436f-ad65-ec6af2d0ddaa"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("fe0df833-b71d-4610-b2f9-1c681d5f9673"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("4ce74ce2-0d7c-4c0d-954d-ac4e427cc539"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("29c9a0d5-9c8a-4c11-b2ff-18e4c6dd2fd1"));

            migrationBuilder.AddColumn<decimal>(
                name: "DepositPrice",
                table: "Transactions",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DepositPrice",
                table: "Leases",
                type: "double",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 623, DateTimeKind.Unspecified).AddTicks(2771), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 623, DateTimeKind.Unspecified).AddTicks(2772), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("07727ab6-a926-48e5-acf6-5416032c5d1a"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7604), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7604), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("19be548c-c368-4508-848b-93e4a57bc8bc"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7617), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7617), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("360cb0ca-4e9a-4238-92d9-333498f286d3"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7562), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7562), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("3d9c0c08-b81b-44dd-9ef0-f664a3e3b909"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7552), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7553), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("49aae438-5971-4e4c-bd0d-8bbb2cc05b86"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7599), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7599), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("4e92f0f9-7221-44eb-bc53-0e60f7ff6f96"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7626), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7626), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("52af45bd-78b5-4d74-8426-0e1a6161b605"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7620), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7620), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("627d108b-549f-4ea1-a5c3-2791e5104e03"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7602), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7602), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("8aa53260-3ad1-4eba-821e-9701b45d5078"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7629), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7629), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("7fb4ada0-ea73-4e48-9226-faf9cdf1e32c"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 634, DateTimeKind.Unspecified).AddTicks(5), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(9456), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 635, DateTimeKind.Unspecified).AddTicks(4146), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 635, DateTimeKind.Unspecified).AddTicks(4140), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 635, DateTimeKind.Unspecified).AddTicks(4150), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 635, DateTimeKind.Unspecified).AddTicks(4147), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 391, DateTimeKind.Unspecified).AddTicks(1597), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 391, DateTimeKind.Unspecified).AddTicks(1599), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$/Emy5XZznjgn7RXcjpBCIOcL7LPUzbG5zUIJJ6poLar6Edyej62EC" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 507, DateTimeKind.Unspecified).AddTicks(8815), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 507, DateTimeKind.Unspecified).AddTicks(8818), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$RjUdjCJA7Vz3AVfhv80ez.Rj5Idf0rpVEdewsNnj4MOcJzCVmf/YK" });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("06d00c59-bd62-46e7-8a12-22eed4bb08d7"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7564), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7564), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("360cb0ca-4e9a-4238-92d9-333498f286d3"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("827acfb5-9d66-4343-801c-0f9b6000af40"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7596), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7597), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("360cb0ca-4e9a-4238-92d9-333498f286d3"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" },
                    { new Guid("c083c4a3-d607-4a26-982b-5fc2fec36cf2"), new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7593), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 18, 22, 29, 0, 633, DateTimeKind.Unspecified).AddTicks(7594), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("360cb0ca-4e9a-4238-92d9-333498f286d3"), null, "Owners", "Owners", "Propriétaires", "basic" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("06d00c59-bd62-46e7-8a12-22eed4bb08d7"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("07727ab6-a926-48e5-acf6-5416032c5d1a"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("19be548c-c368-4508-848b-93e4a57bc8bc"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("3d9c0c08-b81b-44dd-9ef0-f664a3e3b909"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("49aae438-5971-4e4c-bd0d-8bbb2cc05b86"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("4e92f0f9-7221-44eb-bc53-0e60f7ff6f96"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("52af45bd-78b5-4d74-8426-0e1a6161b605"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("627d108b-549f-4ea1-a5c3-2791e5104e03"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("827acfb5-9d66-4343-801c-0f9b6000af40"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("8aa53260-3ad1-4eba-821e-9701b45d5078"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("c083c4a3-d607-4a26-982b-5fc2fec36cf2"));

            migrationBuilder.DeleteData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: new Guid("7fb4ada0-ea73-4e48-9226-faf9cdf1e32c"));

            migrationBuilder.DeleteData(
                table: "NavigationItems",
                keyColumn: "Id",
                keyValue: new Guid("360cb0ca-4e9a-4238-92d9-333498f286d3"));

            migrationBuilder.DropColumn(
                name: "DepositPrice",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "DepositPrice",
                table: "Leases");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 857, DateTimeKind.Unspecified).AddTicks(7210), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 857, DateTimeKind.Unspecified).AddTicks(7211), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("29c9a0d5-9c8a-4c11-b2ff-18e4c6dd2fd1"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6561), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-group", true, "contacts", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6561), new TimeSpan(0, 0, 0, 0, 0)), null, 2, null, null, "Contacts", "Contacts", "Contacts", "collapsible" },
                    { new Guid("3bc9ea05-fbf9-4267-ae75-0e00f641639c"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6572), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office-2", true, "properties", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6572), new TimeSpan(0, 0, 0, 0, 0)), "/property", 3, null, null, "Properties", "Properties", "Propriétés", "basic" },
                    { new Guid("44f213ba-a62b-4667-883c-6567ce45d61b"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6593), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:calendar", true, "reservations", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6594), new TimeSpan(0, 0, 0, 0, 0)), "/reservation", 7, null, null, "Reservations", "Reservations", "Réservations", "basic" },
                    { new Guid("522ddc70-62fe-4013-b0c4-1932482fd0e0"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6552), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:home", true, "dashboard", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6553), new TimeSpan(0, 0, 0, 0, 0)), "/dashboard", 1, null, null, "Dashboard", "Dashboard", "Tableau de bord", "basic" },
                    { new Guid("77f07ae3-4dc4-4c9a-ad9b-eac15438b287"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6589), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:key", true, "keys", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6589), new TimeSpan(0, 0, 0, 0, 0)), "/keys", 5, null, null, "Keys", "Keys", "Clés", "basic" },
                    { new Guid("92153c46-5264-4067-936f-dcb65fe0decb"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6591), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:document-text", true, "leasing", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6592), new TimeSpan(0, 0, 0, 0, 0)), "/leasing", 6, null, null, "Leasing", "Leasing", "Location", "basic" },
                    { new Guid("c6e1d9a8-894d-4ca2-85a4-3bc9cdaa9e92"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6598), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:folder", true, "file-manager", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6598), new TimeSpan(0, 0, 0, 0, 0)), "/gestionnaire-fichiers", 8, null, null, "File Manager", "File Manager", "Gestionnaire de fichiers", "basic" },
                    { new Guid("c93b4721-4a3d-436f-ad65-ec6af2d0ddaa"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6574), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:building-office", true, "buildings", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6574), new TimeSpan(0, 0, 0, 0, 0)), "/building", 4, null, null, "Buildings", "Buildings", "Bâtiments", "basic" },
                    { new Guid("fe0df833-b71d-4610-b2f9-1c681d5f9673"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6600), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:cog-6-tooth", true, "settings", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6600), new TimeSpan(0, 0, 0, 0, 0)), "/settings", 9, null, null, "Settings", "Settings", "Paramètres", "basic" }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AmenitiesJson", "CategoriesJson", "CompanyId", "CreatedOn", "DefaultCity", "DeletedAt", "FeaturesJson", "LastModifiedOn", "PropertyTypesJson", "SearchTerms" },
                values: new object[] { new Guid("4ce74ce2-0d7c-4c0d-954d-ac4e427cc539"), "[\"Parking\",\"Laundry\",\"Air conditioning\",\"Heating\",\"Swimming pool\",\"Gym\",\"Security\",\"Elevator\",\"Balcony\",\"Garden\",\"Garage\",\"Pet friendly\"]", "[{\"Key\":\"location\",\"Reference\":\"AL\"},{\"Key\":\"vente\",\"Reference\":\"AV\"},{\"Key\":\"vacance\",\"Reference\":\"VC\"}]", "687d9fd5-2752-4a96-93d5-0f33a49913c1", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(8715), new TimeSpan(0, 0, 0, 0, 0)), "Tanger", null, "[\"Alarm\",\"Furnished\",\"Renovated\",\"Hardwood floors\",\"Fireplace\",\"Fresh paint\",\"Dishwasher\",\"Walk-in closets\",\"Balcony, Deck, Patio\",\"Internet\",\"Fenced yard\",\"Tile\",\"Carpet\",\"Storage\",\"Unfurnished\"]", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(8196), new TimeSpan(0, 0, 0, 0, 0)), "[\"Residential\",\"Commercial\",\"Industrial\",\"Mixed Use\",\"Vacation Rental\",\"Investment Property\",\"Luxury\",\"Affordable Housing\",\"Student Housing\",\"Senior Living\",\"Retail Space\",\"Office Space\",\"Warehouse\",\"Land\"]", null });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 868, DateTimeKind.Unspecified).AddTicks(1003), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 868, DateTimeKind.Unspecified).AddTicks(996), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "UserPermissions",
                keyColumn: "Id",
                keyValue: new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 868, DateTimeKind.Unspecified).AddTicks(1007), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 868, DateTimeKind.Unspecified).AddTicks(1004), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 639, DateTimeKind.Unspecified).AddTicks(8388), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 639, DateTimeKind.Unspecified).AddTicks(8390), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$Ut.2OKEIOMrThj.Ievp7sOBOg2t7vIqvplhNXYzT9F709IOeOsLty" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                columns: new[] { "CreatedOn", "LastModifiedOn", "Password" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 749, DateTimeKind.Unspecified).AddTicks(6363), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 749, DateTimeKind.Unspecified).AddTicks(6366), new TimeSpan(0, 0, 0, 0, 0)), "$2a$11$VhEjq3yY74DDcL3jV2N8yeAcf406l1nauac2i0n.he4FCX/puxch." });

            migrationBuilder.InsertData(
                table: "NavigationItems",
                columns: new[] { "Id", "CreatedOn", "Icon", "IsActive", "ItemId", "LastModifiedOn", "Link", "Order", "ParentId", "SearchTerms", "Title", "TitleEn", "TitleFr", "Type" },
                values: new object[,]
                {
                    { new Guid("3cdbc37b-6453-41d6-ae12-6560ea1ed3ac"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6563), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user", true, "tenants", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6563), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/tenants", 1, new Guid("29c9a0d5-9c8a-4c11-b2ff-18e4c6dd2fd1"), null, "Tenants", "Tenants", "Locataires", "basic" },
                    { new Guid("4fdcea05-0d1b-4de5-ab2a-c9d13201287d"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6567), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:user-circle", true, "owners", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6568), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/owners", 2, new Guid("29c9a0d5-9c8a-4c11-b2ff-18e4c6dd2fd1"), null, "Owners", "Owners", "Propriétaires", "basic" },
                    { new Guid("5d797ac7-e563-4f46-8b99-2407d300e005"), new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6570), new TimeSpan(0, 0, 0, 0, 0)), "heroicons_outline:wrench-screwdriver", true, "service-pros", new DateTimeOffset(new DateTime(2025, 11, 18, 21, 49, 34, 866, DateTimeKind.Unspecified).AddTicks(6570), new TimeSpan(0, 0, 0, 0, 0)), "/contacts/service-pros", 3, new Guid("29c9a0d5-9c8a-4c11-b2ff-18e4c6dd2fd1"), null, "Service Providers", "Service Providers", "Fournisseurs de services", "basic" }
                });
        }
    }
}
