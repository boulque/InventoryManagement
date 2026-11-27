using InventoryManagement.Code;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventoryManagement.Models
{
    public class Message
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public string? Text { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public int? StockMovementID { get; set; }
        public StockMovement? StockMovement { get; set; }

        [NotMapped]
        public string UserName => SystemData.AppUsers.First(u => u.ID == UserID).Name;
    }

    public record MessageDto(
         int ID,
         int UserID,
         string? Text,
         DateTimeOffset CreatedAt,
         StockMovementDto? StockMovement,
         string UserName
    );
}