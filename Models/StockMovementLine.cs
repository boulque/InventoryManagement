namespace InventoryManagement.Models
{
    public class StockMovementLine
    {
        public int ID { get; set; }

        public int StockMovementID { get; set; }
        public StockMovement StockMovement { get; set; } = null!;

        public int ProductID { get; set; }
        public Product Product { get; set; } = null!;

        public int Quantity { get; set; }
    }

    public record StockMovementLineDto(int ID, ProductDto Product, int Quantity);
}
