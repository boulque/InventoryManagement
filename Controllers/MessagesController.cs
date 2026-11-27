using InventoryManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InventoryManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController(ApplicationContext context) : Controller
    {
        public class MessageData
        {
            public string? Text { get; set; }
            public int? StockMovementID { get; set; }
        }

        private ApplicationContext db = context;

        [HttpGet]
        public async Task<IActionResult> List()
        {
            List<MessageDto> messages = await db.Messages
                .OrderByDescending(m => m.ID)
                .Take(50)
                .Select(m => new MessageDto(
                    m.ID,
                    m.UserID,
                    m.Text,
                    m.CreatedAt,
                    m.StockMovement != null ? new StockMovementDto(
                        m.StockMovement.ID,
                        m.StockMovement.FromWarehouse,
                        m.StockMovement.ToWarehouse,
                        m.StockMovement.UserName,
                        m.StockMovement.Type,
                        m.StockMovement.CreatedAt,
                        m.StockMovement.Comment,
                        null,
                        m.StockMovement.StockMovementLines!.Sum(ml => ml.Quantity)
                    ) : null,
                    m.UserName
                ))
                .ToListAsync();

            return Json(messages);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MessageData messageData)
        {
            string userID = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

            Message message = new()
            {
                UserID = int.Parse(userID),
                Text = messageData.Text,
                CreatedAt = DateTimeOffset.UtcNow,
                StockMovementID = messageData.StockMovementID
            };

            await db.Messages.AddAsync(message);
            await db.SaveChangesAsync();

            return Json(message);
        }
    }
}
