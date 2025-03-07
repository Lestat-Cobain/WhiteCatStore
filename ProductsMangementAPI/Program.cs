using Microsoft.EntityFrameworkCore;
using ProductsMangementAPI.Data;
using ProductsMangementAPI.Models;
using ProductsMangementAPI.Models.DTOs;
using ProductsMangementAPI.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "yourdomain.com", // Change to your issuer
        ValidAudience = "yourdomain.com", // Change to your audience
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your_secret_key")) // Secret Key
    };
});

// Add Authorization service
builder.Services.AddAuthorization();  

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IProductRepository<ProductModel>, ProductRepository>();
builder.Services.AddScoped<ISpProductRepository, SpProductRepository>(sp => new SpProductRepository(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddSingleton<ILoginRepository, LoginRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
    {
        builder
            .AllowAnyOrigin()      // Allow any domain (e.g., Angular app)
            .AllowAnyMethod()      // Allow any HTTP method (GET, POST, etc.)
            .AllowAnyHeader();     // Allow any headers
    });
});

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// 2. Enable the CORS policy globally or for specific endpoints
app.UseCors("AllowAllOrigins");

// Grouping the routes that require authorization
var productApi = app.MapGroup("/products")
    .RequireAuthorization();

app.MapPost("/login", async (LoginModel login, ISpProductRepository SpProductRepository, ILoginRepository LoginRepository) =>
{
    var response = await SpProductRepository.LoginAsync(login);
    // Validate user credentials (you could check from a database or use a mock)
    if (response == 1)
    {
        var token = await LoginRepository.GenerateJwtToken(login.Email);
        return Results.Ok(new { Token = token });
    }

    return Results.Unauthorized();

    
});


app.MapGet("/products", async (ISpProductRepository SpProductRepository) =>
{
    var products = await SpProductRepository.GetProductListAsync();
    return Results.Ok(products);
});

app.MapGet("/products/{productid:int}", async (int productid, ISpProductRepository SpProductRepository) =>
{
    var product = await SpProductRepository.GetProductDetailsAsync(productid);
    return product != null ? Results.Ok(product) : Results.NotFound();
});

app.MapPost("/products", async (ProductModelDTO product, ISpProductRepository SpProductRepository) =>
{
    var response = await SpProductRepository.InsertProductDetailsAsync(product);
});

app.MapPut("/products", async (ProductModel updatedProduct, ISpProductRepository SpProductRepository) =>
{
    var response = await SpProductRepository.UpdateProductDetailsAsync(updatedProduct);

    return Results.NoContent();
});

app.MapDelete("/products/{productid:int}", async (int productid, ISpProductRepository SpProductRepository) =>
{
    await SpProductRepository.DeleteProductAsync(productid);
    return Results.NoContent();
});


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Run();
