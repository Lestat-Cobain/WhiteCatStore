using Microsoft.EntityFrameworkCore;
using ProductsMangementAPI.Models;

namespace ProductsMangementAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<ProductModel> Products { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProductDetailsModel>().HasNoKey();

            base.OnModelCreating(modelBuilder);
        }

    }
}
