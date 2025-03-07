using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProductsMangementAPI.Models
{
    public class ProductModel
    {
        public int ProductId { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public ProductDetailsModel Details { get; set; } = new ProductDetailsModel();
        public string? ImageUrl { get; set; }
    }
}
