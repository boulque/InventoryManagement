using InventoryManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Code.Managers
{
    public interface IFileManager
    {
        public Task<ProjectFile> Upload(IFormFile file);
        public Task Delete(string folderGUID);
    }

    public class FileManager(ApplicationContext context, IWebHostEnvironment env) : IFileManager
    {
        public readonly string StoragePath = Path.Combine(env.ContentRootPath, "App_Data", "InvMgmt_Files");

        private ApplicationContext db = context;

        public async Task<ProjectFile> Upload(IFormFile imageFile)
        {
            string guid = Guid.NewGuid().ToString();
            string filePath = Path.Combine(StoragePath, guid + Path.GetExtension(imageFile.FileName));

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            ProjectFile projectFile = new()
            {
                Name = imageFile.FileName,
                GUID = guid,
                Path = filePath,
                Size = imageFile.Length,
                FolderGUID = Guid.NewGuid().ToString(),
                Extension = Path.GetExtension(imageFile.FileName)
            };

            await db.ProjectFiles.AddAsync(projectFile);
            await db.SaveChangesAsync();

            return projectFile;
        }

        public async Task Delete(string folderGUID)
        {
            IEnumerable<ProjectFile> files = await db.ProjectFiles.Where(f => f.FolderGUID == folderGUID).ToListAsync();

            // Delete from storage
            foreach (ProjectFile file in files)
            {
                if (File.Exists(file.Path))
                    File.Delete(file.Path);
            }

            // Delete from db
            db.ProjectFiles.RemoveRange(files);
            await db.SaveChangesAsync();
        }
    }
}
