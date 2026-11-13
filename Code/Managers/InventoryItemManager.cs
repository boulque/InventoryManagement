using InventoryManagement.Models;
using Microsoft.EntityFrameworkCore;


namespace InventoryManagement.Code.Managers
{
    public record MovementStatus(bool IsError, string? Message);

    public interface IInventoryItemManager
    {
        public Task<MovementStatus> Receive(int warehouseID, IEnumerable<InventoryItem> inventoryItems);
        public Task<MovementStatus> Remove(int warehouseID, IEnumerable<InventoryItem> inventoryItems);
    }

    public class InventoryItemManager(ApplicationContext context) : IInventoryItemManager
    {
        private ApplicationContext db = context;

        public async Task<MovementStatus> Receive(int warehouseID, IEnumerable<InventoryItem> inventoryItems)
        {
            List<InventoryItem> newItems = [];

            List<int> productIDs = inventoryItems.Select(item => item.ProductID).ToList();

            List<InventoryItem> existingItems = await db.InventoryItems
                .Where(item => item.WarehouseID == warehouseID && productIDs.Contains(item.ProductID))
                .ToListAsync();

            foreach (InventoryItem inventoryItem in inventoryItems)
            {
                InventoryItem? existingItem = existingItems.FirstOrDefault(item => item.ProductID == inventoryItem.ProductID);

                if (existingItem != null)
                {
                    existingItem.Quantity += inventoryItem.Quantity;
                    existingItem.LastUpdate = DateTimeOffset.UtcNow;
                    db.InventoryItems.Update(existingItem);
                }
                else
                {
                    newItems.Add(new InventoryItem
                    {
                        ProductID = inventoryItem.ProductID,
                        WarehouseID = warehouseID,
                        Quantity = inventoryItem.Quantity,
                        LastUpdate = DateTimeOffset.UtcNow
                    });
                }
            }

            if (newItems.Count > 0)
                await db.InventoryItems.AddRangeAsync(newItems);

            await db.SaveChangesAsync();
            return new MovementStatus(false, null);
        }

        public async Task<MovementStatus> Remove(int warehouseID, IEnumerable<InventoryItem> inventoryItems)
        {
            List<int> productIDs = inventoryItems.Select(item => item.ProductID).ToList();

            List<Product> products = await db.Products
                .Where(p => productIDs.Contains(p.ID))
                .ToListAsync();

            List<InventoryItem> existingItems = await db.InventoryItems
                .Where(item => item.WarehouseID == warehouseID && productIDs.Contains(item.ProductID))
                .ToListAsync();

            foreach (InventoryItem inventoryItem in inventoryItems)
            {
                InventoryItem? existingItem = existingItems.FirstOrDefault(item => item.ProductID == inventoryItem.ProductID);
                Product? product = products.FirstOrDefault(p => p.ID == inventoryItem.ProductID);

                if (existingItem == null)
                    return new MovementStatus(true, $"Product \"{product?.Name ?? "Unknown"}\" not found in the warehouse.");

                if (existingItem.Quantity < inventoryItem.Quantity)
                    return new MovementStatus(true, $"Cannot process the operation, because the remainder of the product \"{existingItem.Product!.Name}\" is insufficient ({existingItem.Quantity} available, {inventoryItem.Quantity} requested).");

                if (existingItem.Quantity > inventoryItem.Quantity)
                {
                    existingItem.Quantity -= inventoryItem.Quantity;
                    db.InventoryItems.Update(existingItem);
                }
                else
                    db.InventoryItems.Remove(existingItem);
            }

            await db.SaveChangesAsync();
            return new MovementStatus(false, null);
        }
    }
}
