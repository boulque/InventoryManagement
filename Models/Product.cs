using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace InventoryManagement.Models
{
    public class Product
    {
        public int ID { get; set; }
        public string Name { get; set; } = "";
        public int? ProjectFileID { get; set; }
        public int? Category { get; set; }
        public int? Brand { get; set; }
        public string Barcode { get; set; } = "";

        [JsonIgnore]
        public ProjectFile? ProjectFile { get; set; }

        [NotMapped]
        public string? Image => ProjectFile?.Url;

        [NotMapped]
        public string? ImageFolderGUID => ProjectFile?.FolderGUID;

        [NotMapped]
        public int Remainder { get; set; }
    }

    public record ProductDto(
        int ID,
        string Name,
        int? Category,
        int? Brand,
        string? Image,
        string? ImageFolderGUID);
}
