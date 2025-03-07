using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace ProductsMangementAPI.Models
{
    public class ProductDetailsModel
    {
        public int ProductId { get; set; }
        public string Provider { get; set; }
        public string ProductDetails { get; set; }
        public string GuaranteeTime { get; set; }
        public int InStock { get; set; }
    }
}
