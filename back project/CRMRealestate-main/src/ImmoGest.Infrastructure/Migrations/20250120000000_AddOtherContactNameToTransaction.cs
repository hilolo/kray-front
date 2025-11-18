using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOtherContactNameToTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Make ContactId nullable
            migrationBuilder.AlterColumn<Guid>(
                name: "ContactId",
                table: "Transactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: false,
                oldCollation: "ascii_general_ci");

            // Add OtherContactName column
            migrationBuilder.AddColumn<string>(
                name: "OtherContactName",
                table: "Transactions",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove OtherContactName column
            migrationBuilder.DropColumn(
                name: "OtherContactName",
                table: "Transactions");

            // Make ContactId required again
            migrationBuilder.AlterColumn<Guid>(
                name: "ContactId",
                table: "Transactions",
                type: "char(36)",
                nullable: false,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true,
                oldCollation: "ascii_general_ci");
        }
    }
}

