using InventoryManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockMovementsController(ApplicationContext context) : Controller
    {
        private ApplicationContext db = context;

        [HttpGet]
        public async Task<IActionResult> List()
        {
            List<StockMovementDto> stockMovements = await db.StockMovements
                .Include(m => m.FromWarehouse)
                .Include(m => m.ToWarehouse)
                .OrderByDescending(m => m.ID)
                .Select(m => new StockMovementDto(
                    m.ID,
                    m.FromWarehouse,
                    m.ToWarehouse,
                    m.UserName,
                    m.Type,
                    m.CreatedAt,
                    m.Comment,
                    null,
                    m.StockMovementLines!.Sum(ml => ml.Quantity)))
                .Take(50)
                .ToListAsync();

            return Json(stockMovements);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            StockMovementDto? dto = await db.StockMovements
                .Where(m => m.ID == id)
                .Select(m => new StockMovementDto(
                    m.ID,
                    m.FromWarehouse,
                    m.ToWarehouse,
                    m.UserName,
                    m.Type,
                    m.CreatedAt,
                    m.Comment,
                    m.StockMovementLines!
                        .Select(ml => new StockMovementLineDto(
                            ml.ID,
                            new ProductDto(
                                ml.Product!.ID,
                                ml.Product.Name,
                                ml.Product.Category,
                                ml.Product.Brand,
                                ml.Product.ProjectFile != null ? ml.Product.ProjectFile.Url : null,
                                ml.Product.ProjectFile != null ? ml.Product.ProjectFile.FolderGUID : null),
                           ml.Quantity))
                        .ToList(),
                    m.StockMovementLines!.Sum(ml => ml.Quantity)))
                .FirstOrDefaultAsync();

            if (dto == null)
                return NotFound();

            return Json(dto);
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<IActionResult> HasLines(int? warehouseID, int? productID)
        {
            StockMovementLine? stockMovementLine = await db.StockMovementLines
                .FirstOrDefaultAsync(ml => (productID == null || ml.ProductID == productID) &&
                    (warehouseID == null || ml.StockMovement.FromWarehouseID == warehouseID || ml.StockMovement.ToWarehouseID == warehouseID));

            return Json(stockMovementLine != null);
        }
    }
}
