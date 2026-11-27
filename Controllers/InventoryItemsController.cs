using InventoryManagement.Code.Managers;
using InventoryManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InventoryManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryItemsController(ApplicationContext context, IInventoryItemManager inventoryItemManager) : Controller
    {
        public class MovementRequest
        {
            public int Type { get; set; }
            public int? FromWarehouseID { get; set; }
            public int? ToWarehouseID { get; set; }
            public string? Comment { get; set; }
            public List<InventoryItem>? InventoryItems { get; set; }
        }

        private ApplicationContext db = context;
        private IInventoryItemManager inventoryItemManager = inventoryItemManager;

        [HttpGet]
        public async Task<IActionResult> List(int warehouseID)
        {
            List<InventoryItem> inventoryItems = await db.InventoryItems
                .Where(item => item.WarehouseID == warehouseID)
                .Include(item => item.Product)
                .Include(item => item.Warehouse)
                .Include(item => item.Product!.ProjectFile)
                .OrderByDescending(item => item.LastUpdate)
                .ToListAsync();
            return Json(inventoryItems);
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<IActionResult> Receipt([FromBody] MovementRequest movementRequest)
        {
            if (movementRequest.InventoryItems == null)
                return BadRequest();
            if (movementRequest.ToWarehouseID == null)
                return BadRequest();

            MovementStatus status = await inventoryItemManager.Receive(movementRequest.ToWarehouseID.Value, movementRequest.InventoryItems);
            if (status.IsError)
                return Json(status);

            await AddStockMovement(movementRequest);
            await db.SaveChangesAsync();

            return Json(status);
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<IActionResult> Transfer([FromBody] MovementRequest movementRequest)
        {
            if (movementRequest.InventoryItems == null)
                return BadRequest();
            if (movementRequest.FromWarehouseID == null || movementRequest.ToWarehouseID == null)
                return BadRequest();

            MovementStatus removeStatus = await inventoryItemManager.Remove(movementRequest.FromWarehouseID.Value, movementRequest.InventoryItems);
            if (removeStatus.IsError)
                return Json(removeStatus);

            MovementStatus receiveStatus = await inventoryItemManager.Receive(movementRequest.ToWarehouseID.Value, movementRequest.InventoryItems);
            if (receiveStatus.IsError)
                return Json(receiveStatus);

            await AddStockMovement(movementRequest);
            await db.SaveChangesAsync();

            return Json(receiveStatus);
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<IActionResult> Dispatch([FromBody] MovementRequest movementRequest)
        {
            if (movementRequest.InventoryItems == null)
                return BadRequest();
            if (movementRequest.FromWarehouseID == null)
                return BadRequest();

            MovementStatus status = await inventoryItemManager.Remove(movementRequest.FromWarehouseID.Value, movementRequest.InventoryItems);
            if (status.IsError)
                return Json(status);

            await AddStockMovement(movementRequest);
            await db.SaveChangesAsync();

            return Json(status);
        }

        private async Task AddStockMovement(MovementRequest movementRequest)
        {
            string userID = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

            StockMovement stockMovement = new()
            {
                UserID = int.Parse(userID),
                FromWarehouseID = movementRequest.FromWarehouseID,
                ToWarehouseID = movementRequest.ToWarehouseID,
                Type = (MovementType)movementRequest.Type,
                CreatedAt = DateTimeOffset.UtcNow,
                Comment = movementRequest.Comment
            };

            await db.StockMovements.AddAsync(stockMovement);
            await db.SaveChangesAsync();

            List<StockMovementLine> stockMovementLines = [];

            foreach (InventoryItem inventoryItem in movementRequest.InventoryItems!)
            {
                stockMovementLines.Add(new StockMovementLine
                {
                    StockMovementID = stockMovement.ID,
                    ProductID = inventoryItem.ProductID,
                    Quantity = inventoryItem.Quantity
                });
            }

            await db.StockMovementLines.AddRangeAsync(stockMovementLines);
        }
    }
}
