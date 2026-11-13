using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace InventoryManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddStockMovementHeaders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Products_ProductID",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_ProductID",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "ProductID",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "StockMovements");

            migrationBuilder.CreateTable(
                name: "StockMovementLines",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StockMovementID = table.Column<int>(type: "integer", nullable: false),
                    ProductID = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockMovementLines", x => x.ID);
                    table.ForeignKey(
                        name: "FK_StockMovementLines_Products_ProductID",
                        column: x => x.ProductID,
                        principalTable: "Products",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockMovementLines_StockMovements_StockMovementID",
                        column: x => x.StockMovementID,
                        principalTable: "StockMovements",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovementLines_ProductID",
                table: "StockMovementLines",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovementLines_StockMovementID",
                table: "StockMovementLines",
                column: "StockMovementID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StockMovementLines");

            migrationBuilder.AddColumn<int>(
                name: "ProductID",
                table: "StockMovements",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "StockMovements",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ProductID",
                table: "StockMovements",
                column: "ProductID");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Products_ProductID",
                table: "StockMovements",
                column: "ProductID",
                principalTable: "Products",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
