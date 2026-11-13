using InventoryManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement
{
    public class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<ProjectFile> ProjectFiles { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<StockMovementLine> StockMovementLines { get; set; }
    }
}