using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventoryManagement.Models
{
    public class InventoryItem
    {
        public int ID { get; set; }
        public int ProductID { get; set; }
        public Product? Product { get; set; }

        public int WarehouseID { get; set; }
        public Warehouse? Warehouse { get; set; }

        public int Quantity { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string Zone { get; set; } = "";
        public DateTimeOffset LastUpdate { get; set; }

        [NotMapped]
        public string Name => Product?.Name ?? "";

        [NotMapped]
        public int? Category => Product?.Category;

        [NotMapped]
        public int? Brand => Product?.Brand;

        [NotMapped]
        public string? Image => Product?.Image;
    }
}