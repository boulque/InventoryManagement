using InventoryManagement.Code.Managers;
using InventoryManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Web;
using System.Xml.Linq;

namespace InventoryManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : Controller
    {
        public class ProductData
        {
            public int ID { get; set; }
            public string Name { get; set; } = "";
            public IFormFile? ImageFile { get; set; }
            public bool ImageChanged { get; set; }
            public int? Category { get; set; }
            public int? Brand { get; set; }
            public string Barcode { get; set; } = "";
        }

        public class ImportRequest
        {
            [Required]
            public string Xml { get; set; } = "";
        }

        private ApplicationContext db;
        private IRemoteFileManager fileManager;

        public ProductsController(ApplicationContext context, IRemoteFileManager fileManager)
        {
            db = context;
            this.fileManager = fileManager;
        }

        [HttpGet]
        public async Task<IActionResult> List(string? barcode, int? warehouseID, int? brand, int? category)
        {
            barcode = HttpUtility.UrlDecode(barcode);

            List<Product> products = await db.Products
                .Where(p => (string.IsNullOrEmpty(barcode) || p.Barcode == barcode) &&
                    (brand == null || p.Brand == brand) &&
                    (category == null || p.Category == category))
                .Include(p => p.ProjectFile)
                .OrderByDescending(p => p.ID)
                .ToListAsync();

            List<Product> resultProducts;

            if (warehouseID != null && products.Count > 0)
            {
                resultProducts = [];
                List<int> productIDs = products.Select(p => p.ID).ToList();
                List<InventoryItem> inventoryItems = await db.InventoryItems
                    .Where(i => i.WarehouseID == warehouseID && productIDs.Contains(i.ProductID))
                    .ToListAsync();

                foreach (Product product in products)
                {
                    InventoryItem? inventoryItem = inventoryItems.FirstOrDefault(i => i.ProductID == product.ID);
                    if (inventoryItem != null)
                    {
                        product.Remainder = inventoryItem.Quantity;
                        resultProducts.Add(product);
                    }
                }
            }
            else
                resultProducts = products;

            return Json(resultProducts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            Product? product = await db.Products.Include(p => p.ProjectFile).FirstOrDefaultAsync(p => p.ID == id);
            if (product == null)
                return NotFound();

            return Json(product);
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        [RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        public async Task<IActionResult> Create([FromForm] ProductData productData)
        {
            // Upload file
            ProjectFile? projectFile = productData.ImageFile != null ? 
                await fileManager.Upload(productData.ImageFile) : null;

            // Create product
            Product product = new()
            {
                Name = productData.Name,
                ProjectFileID = projectFile?.ID,
                Category = productData.Category,
                Brand = productData.Brand,
                Barcode = productData.Barcode
            };

            await db.Products.AddAsync(product);
            await db.SaveChangesAsync();

            return Json(new { product.ID });
        }

        [HttpPut]
        [DisableRequestSizeLimit]
        [RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        public async Task<IActionResult> Update([FromForm] ProductData productData)
        {
            if (productData.ID <= 0)
                return BadRequest();

            // Upload file
            ProjectFile? projectFile = productData.ImageFile != null ?
                await fileManager.Upload(productData.ImageFile) : null;

            // Update product
            Product? product = await db.Products.FirstOrDefaultAsync(p => p.ID == productData.ID);
            if (product == null)
                return NotFound();

            product.Name = productData.Name;
            if (productData.ImageChanged)
                product.ProjectFileID = projectFile?.ID;
            product.Category = productData.Category;
            product.Brand = productData.Brand;
            product.Barcode = productData.Barcode;

            db.Products.Update(product);
            await db.SaveChangesAsync();

            return Json(new { product.ID });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            Product? product = await db.Products.Include(p => p.ProjectFile).FirstOrDefaultAsync(p => p.ID == id);
            if (product == null)
                return NotFound();

            // Delete file
            if (!string.IsNullOrEmpty(product.ImageFolderGUID))
                await fileManager.Delete(product.ImageFolderGUID);

            // Delete product
            db.Products.Remove(product);
            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<IActionResult> Import([FromBody] ImportRequest request)
        {
            XDocument xDoc = XDocument.Parse(request.Xml);

            List<Product> products = [];
            int idx = 1;

            foreach (XElement xProduct in xDoc.Root!.Elements("Product"))
            {
                products.Add(new Product
                {
                    Name = xProduct.Element("Name")!.Value,
                    Category = int.Parse(xProduct.Element("Category")!.Value),
                    Brand = int.Parse(xProduct.Element("Brand")!.Value),
                    Barcode = idx++.ToString()
                });
            }

            await db.Products.AddRangeAsync(products);
            await db.SaveChangesAsync();

            return Ok();
        }
    }
}
