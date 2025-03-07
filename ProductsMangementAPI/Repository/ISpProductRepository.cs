using ProductsMangementAPI.Models;
using ProductsMangementAPI.Models.DTOs;

namespace ProductsMangementAPI.Repository
{
    public interface ISpProductRepository
    {
        public Task<ProductModel> GetProductDetailsAsync(int productId);

        public Task<List<ProductModel>> GetProductListAsync();

        public Task<int> InsertProductDetailsAsync(ProductModelDTO model);

        public Task<int> UpdateProductDetailsAsync(ProductModel model);

        public Task DeleteProductAsync(int productId);

        public Task<int> LoginAsync(LoginModel model);
    }
}
