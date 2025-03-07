namespace ProductsMangementAPI.Models.DTOs
{
    public class ProductModelDTO
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public ProductDetailsModelDTO Details { get; set; } = new ProductDetailsModelDTO();
        public string? ImageUrl { get; set; }
    }
}
