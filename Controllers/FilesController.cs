using InventoryManagement.Code.Managers;
using InventoryManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController(ApplicationContext context) : Controller
    {
        private ApplicationContext db = context;

        [HttpGet(@"{folderGUID:regex([[\w\-]]+)}")]
        public async Task<IActionResult> Index(string folderGUID)
        {
            return Json(await db.ProjectFiles.Where(f => f.FolderGUID == folderGUID).ToListAsync());
        }

        [HttpGet(@"download/{fileGUID:regex([[\w\-]]+)}")]
        public async Task<IActionResult> Download(string fileGUID)
        {
            ProjectFile? projectFile = await db.ProjectFiles.FirstOrDefaultAsync(f => f.GUID == fileGUID);
            if (projectFile == null)
                return NotFound();

            return PhysicalFile(projectFile.Path, "application/octet-stream", projectFile.Name);
        }
    }
}
