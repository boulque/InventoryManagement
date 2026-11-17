using Amazon.S3;
using Amazon.S3.Model;
using InventoryManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Code.Managers
{
    public interface IRemoteFileManager
    {
        public Task<ProjectFile> Upload(IFormFile file);
        public Task Delete(string folderGUID);
    }

    public class RemoteFileManager : IRemoteFileManager
    {
        private AmazonS3Config config;

        private IAmazonS3 client;

        private ApplicationContext db;

        private const string BUCKET_NAME = "imstorage-777";

        public RemoteFileManager(ApplicationContext context)
        {
            config = new AmazonS3Config
            {
                ServiceURL = "https://storage.yandexcloud.net",
                AuthenticationRegion = "ru-central1"
            };

            client = new AmazonS3Client(
                Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID"),
                Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY"),
                config
            );
            db = context;
        }

        public async Task<ProjectFile> Upload(IFormFile imageFile)
        {
            string guid = Guid.NewGuid().ToString();
            string fileName = guid + Path.GetExtension(imageFile.FileName);

            using var stream = imageFile.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName = BUCKET_NAME,
                Key = fileName,
                InputStream = stream,
                ContentType = "application/octet-stream",
                DisablePayloadSigning = true
            };

            await client.PutObjectAsync(request);

            ProjectFile projectFile = new()
            {
                Name = imageFile.FileName,
                GUID = guid,
                Path = "",
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
                var request = new DeleteObjectRequest
                {
                    BucketName = BUCKET_NAME,
                    Key = file.GUID + file.Extension
                };
                await client.DeleteObjectAsync(request);
            }

            // Delete from db
            db.ProjectFiles.RemoveRange(files);
            await db.SaveChangesAsync();
        }
    }
}
