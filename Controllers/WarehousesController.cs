using InventoryManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehousesController(ApplicationContext context) : Controller
    {
        private ApplicationContext db = context;

        [HttpGet]
        public async Task<IActionResult> List()
        {
            List<Warehouse> warehouses = await db.Warehouses
                .OrderByDescending(w => w.ID)
                .ToListAsync();
            return Json(warehouses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Json(await db.Warehouses.FirstOrDefaultAsync(w => w.ID == id));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] Warehouse warehouse)
        {
            await db.Warehouses.AddAsync(warehouse);
            await db.SaveChangesAsync();

            return Json(new { warehouse.ID });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromForm] Warehouse warehouse)
        {
            if (warehouse.ID <= 0)
                return BadRequest();

            db.Warehouses.Update(warehouse);
            await db.SaveChangesAsync();

            return Json(new { warehouse.ID });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            Warehouse? warehouse = await db.Warehouses.FirstOrDefaultAsync(w => w.ID == id);
            if (warehouse == null)
                return NotFound();

            db.Warehouses.Remove(warehouse);
            await db.SaveChangesAsync();

            return Ok();
        }
    }
}
