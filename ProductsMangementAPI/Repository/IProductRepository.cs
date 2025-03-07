using ProductsMangementAPI.Models;

namespace ProductsMangementAPI.Repository
{
    public interface IProductRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllProducts();
        Task<T> GetProductById(int id);
        Task AddProduct(T entity);
        Task UpdateProduct(T entity);
        Task DeleteProduct(int id);
    }
}
