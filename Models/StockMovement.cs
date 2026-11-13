using System.ComponentModel.DataAnnotations.Schema;

namespace InventoryManagement.Models
{
    public class StockMovement
    {
        public int ID { get; set; }

        public int? FromWarehouseID { get; set; }
        public Warehouse? FromWarehouse { get; set; }

        public int? ToWarehouseID { get; set; }
        public Warehouse? ToWarehouse { get; set; }

        public MovementType Type { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        public string? Comment { get; set; }

        [NotMapped]
        public int Quantity { get; set; }

        public List<StockMovementLine>? StockMovementLines { get; set; }
    }

    public enum MovementType
    {
        Receipt = 0,
        Transfer = 1,
        Dispatch = 2
    }

    public record StockMovementDto(
        int ID,
        Warehouse? FromWarehouse,
        Warehouse? ToWarehouse,
        MovementType Type,
        DateTimeOffset CreatedAt,
        string? Comment,
        List<StockMovementLineDto>? Lines,
        int Quantity);
}
