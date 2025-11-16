using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIsSharedFromProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsShared",
                table: "Properties");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsShared",
                table: "Properties",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}

