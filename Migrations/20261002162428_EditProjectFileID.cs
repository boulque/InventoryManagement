using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventoryManagement.Migrations
{
    /// <inheritdoc />
    public partial class EditProjectFileID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_ProjectFiles_ProjectFileID",
                table: "Products");

            migrationBuilder.AlterColumn<int>(
                name: "ProjectFileID",
                table: "Products",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_ProjectFiles_ProjectFileID",
                table: "Products",
                column: "ProjectFileID",
                principalTable: "ProjectFiles",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_ProjectFiles_ProjectFileID",
                table: "Products");

            migrationBuilder.AlterColumn<int>(
                name: "ProjectFileID",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_ProjectFiles_ProjectFileID",
                table: "Products",
                column: "ProjectFileID",
                principalTable: "ProjectFiles",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
