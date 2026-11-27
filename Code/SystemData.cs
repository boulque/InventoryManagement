namespace InventoryManagement.Code
{
    public record AppUser(int ID, string Name);

    public static class SystemData
    {
        public static List<AppUser> AppUsers =>
        [
            new(1, "Admin"),
            new(2, "Manager"),
            new(3, "Worker")
        ];
    }
}
