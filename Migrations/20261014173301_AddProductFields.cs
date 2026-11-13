using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventoryManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddProductFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Brand",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Threshold",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Threshold",
                table: "Products");
        }
    }
}
