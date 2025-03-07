using Microsoft.Data.SqlClient;
using ProductsMangementAPI.Models;
using ProductsMangementAPI.Models.DTOs;
using System.Data;

namespace ProductsMangementAPI.Repository
{
    public class SpProductRepository : ISpProductRepository
    {
        private readonly string _connectionString;

        // Inject the connection string via constructor
        public SpProductRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public string[] ImagesType = new [] { "image/jpeg", "image/jpg", "image/png", "application/pdf" };

        public async Task<int> LoginAsync(LoginModel model)
        {
            int Response = 0;
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    using (SqlCommand command = new SqlCommand("sp_Login", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        command.Parameters.Add(new SqlParameter("@email", model.Email));
                        command.Parameters.Add(new SqlParameter("@password", model.Password));

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                Response = reader.GetInt32(0);
                            }
                        }
                    }
                }
                return Response;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        public async Task<ProductModel> GetProductDetailsAsync(int productId)
        {
            var product = new ProductModel();

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (SqlCommand command = new SqlCommand("sp_GetProductById", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add(new SqlParameter("@productId", productId));

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var prod = new ProductModel
                            {
                                ProductId = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Price = reader.GetDecimal(2),
                                Details = new ProductDetailsModel
                                {
                                    Provider = reader.GetString(3),
                                    ProductDetails = reader.GetString(4),
                                    GuaranteeTime = reader.GetString(5),
                                    InStock = reader.GetInt32(6)
                                },
                                ImageUrl = !reader.IsDBNull(8)
                                        ? reader.GetString(7) + Convert.ToBase64String((byte[])reader[8])
                                        : null
                            };
                            product = prod;
                        }
                    }
                }
            }
            return product;
        }

        public async Task<List<ProductModel>> GetProductListAsync()
        {
            try
            {
                var products = new List<ProductModel>();

                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    using (SqlCommand command = new SqlCommand("sp_GetProductList", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var product = new ProductModel
                                {
                                    ProductId = reader.GetInt32(0),
                                    Name = reader.GetString(1),
                                    Price = reader.GetDecimal(2),
                                };
                                products.Add(product);
                            }
                        }
                    }
                }
                return products;
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public async Task<int> InsertProductDetailsAsync(ProductModelDTO model)
        {
            int newProductId = 0;

            // Extract MIME type and Base64 content correctly
            var parts = model.ImageUrl.Split(",");
            if (parts.Length < 2)
                throw new ArgumentException("Invalid ImageUrl format");

            string imageMimeType = parts[0].Replace("data:", "").Replace(";base64", "").Trim();
            byte[]? imageBytes = Convert.FromBase64String(parts[1]);

            // Determine Image ID based on MIME type
            int imageId = imageMimeType switch
            {
                "image/jpeg" or "image/jpg" => 1,
                "image/png" => 2,
                _ => 3 // Default case
            };

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_InsertNewProduct", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Add parameters efficiently
            command.Parameters.AddWithValue("@name", model.Name);
            command.Parameters.AddWithValue("@price", model.Price);
            command.Parameters.AddWithValue("@provider", model.Details.Provider);
            command.Parameters.AddWithValue("@productDetails", model.Details.ProductDetails);
            command.Parameters.AddWithValue("@guaranteTime", model.Details.GuaranteeTime);
            command.Parameters.AddWithValue("@inStock", model.Details.InStock);
            command.Parameters.AddWithValue("@productImage", imageBytes);
            command.Parameters.AddWithValue("@imageId", imageId);

            // Execute and retrieve the new product ID
            var result = await command.ExecuteScalarAsync();
            if (result != null) newProductId = Convert.ToInt32(result);

            return newProductId;
        }


        public async Task<int> UpdateProductDetailsAsync(ProductModel model)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (SqlCommand command = new SqlCommand("sp_UpdateProductDetails", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add(new SqlParameter("@productId", model.ProductId));
                    command.Parameters.Add(new SqlParameter("@name", model.Name));
                    command.Parameters.Add(new SqlParameter("@price", model.Price));
                    command.Parameters.Add(new SqlParameter("@provider", model.Details.Provider));
                    command.Parameters.Add(new SqlParameter("@productDetails", model.Details.ProductDetails));
                    command.Parameters.Add(new SqlParameter("@guaranteTime", model.Details.GuaranteeTime));
                    command.Parameters.Add(new SqlParameter("@inStock", model.Details.InStock));

                    // Execute the command and retrieve the new product ID
                    var result = await command.ExecuteScalarAsync();
                }
            }
            return model.ProductId;
        }

        public async Task DeleteProductAsync(int productId)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (SqlCommand command = new SqlCommand("sp_DeleteProct", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add(new SqlParameter("@productId", productId));

                    await command.ExecuteScalarAsync();
                }
            }
        }
    }
}
