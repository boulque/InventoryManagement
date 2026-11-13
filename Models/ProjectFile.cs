namespace InventoryManagement.Models
{
    public class ProjectFile
    {
        public int ID { get; set; }
        public string Name { get; set; } = "";
        public string GUID { get; set; } = "";
        public string Path { get; set; } = "";
        public long Size { get; set; }
        public string FolderGUID { get; set; } = "";
        public string Extension { get; set; } = "";
    }
}
