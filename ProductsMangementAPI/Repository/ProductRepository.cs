using Microsoft.EntityFrameworkCore;
using ProductsMangementAPI.Data;
using ProductsMangementAPI.Models;
using System;

namespace ProductsMangementAPI.Repository
{
    public class ProductRepository : IProductRepository<ProductModel>
    {
        private readonly AppDbContext _context;
        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductModel>> GetAllProducts()
        {
            return await _context.Products.ToListAsync();
        }

        public async Task<ProductModel> GetProductById(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        public async Task AddProduct(ProductModel product)
        {
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateProduct(ProductModel product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }
    }
}
