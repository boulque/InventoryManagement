using InventoryManagement.Code.Managers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace InventoryManagement.Controllers
{
    [Route("[controller]")]
    public class ImagesController : Controller
    {
        [Route(@"{fileName:regex([[\w\-\.]]+)}")]
        public async Task<IActionResult> Index(string fileName)
        {
            //string filePath = Path.Combine(FileManager.StoragePath, fileName);

            //var provider = new FileExtensionContentTypeProvider();
            //if (!provider.TryGetContentType(filePath, out var contentType))
            //    contentType = "application/octet-stream";

            //var fileStream = System.IO.File.OpenRead(filePath);
            //return File(fileStream, contentType);
            return NotFound();
        }
    }
}
