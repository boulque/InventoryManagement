using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace InventoryManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddStockMovements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StockMovements",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductID = table.Column<int>(type: "integer", nullable: false),
                    FromWarehouseID = table.Column<int>(type: "integer", nullable: true),
                    ToWarehouseID = table.Column<int>(type: "integer", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockMovements", x => x.ID);
                    table.ForeignKey(
                        name: "FK_StockMovements_Products_ProductID",
                        column: x => x.ProductID,
                        principalTable: "Products",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockMovements_Warehouses_FromWarehouseID",
                        column: x => x.FromWarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_StockMovements_Warehouses_ToWarehouseID",
                        column: x => x.ToWarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_FromWarehouseID",
                table: "StockMovements",
                column: "FromWarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ProductID",
                table: "StockMovements",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ToWarehouseID",
                table: "StockMovements",
                column: "ToWarehouseID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StockMovements");
        }
    }
}
