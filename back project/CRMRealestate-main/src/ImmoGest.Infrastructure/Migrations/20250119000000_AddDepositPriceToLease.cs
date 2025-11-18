using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ImmoGest.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepositPriceToLease : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DepositPrice",
                table: "Leases",
                type: "double",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DepositPrice",
                table: "Leases");
        }
    }
}

