using System.ComponentModel.DataAnnotations;

namespace InventoryManagement.Models
{
    public class Warehouse
    {
        public int ID { get; set; }
        public string Name { get; set; } = "";

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string Address { get; set; } = "";
        public int Type { get; set; }
    }
}