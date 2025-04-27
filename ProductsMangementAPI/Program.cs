using Microsoft.EntityFrameworkCore;
using ProductsMangementAPI.Data;
using ProductsMangementAPI.Models;
using ProductsMangementAPI.Models.DTOs;
using ProductsMangementAPI.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using System.IdentityModel.Tokens.Jwt;
using ProductsMangementAPI.Helpers;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog(); 

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
        ValidIssuer = builder.Configuration["JwtParams:Url"], // Change to your issuer
        ValidAudience = builder.Configuration["JwtParams:Url"], // Change to your audience
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your_super_long_secret_key_that_is_32_chars")) // Secret Key
    };
});

// Add Authorization service
builder.Services.AddAuthorization();  

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CookieHelper>();
builder.Services.AddScoped<IProductRepository<ProductModel>, ProductRepository>();
builder.Services.AddScoped<ISpProductRepository, SpProductRepository>(sp => new SpProductRepository(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddSingleton<ILoginRepository, LoginRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("*","http://localhost:4200", "http://localhost:3200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();

// Grouping the routes that require authorization
var productApi = app.MapGroup("/products")
    .RequireAuthorization();

app.MapPost("/login", async (LoginModel login, ISpProductRepository SpProductRepository, ILoginRepository LoginRepository, CookieHelper cookieHelper, HttpResponse response) =>
{
    var loginResult = await SpProductRepository.LoginAsync(login);

    Log.Information("LoginAsync response: {Response} for user {Email}", loginResult, login.Email);

    if (loginResult == 1)
    {
        var token = await LoginRepository.GenerateJwtToken(login.Email);

        cookieHelper.SetCookie("auth_token", token, DateTime.Now.AddMinutes(15), 15);

        return Results.Ok(new { message = "Login successful" });
    }

    return Results.Unauthorized();
});

app.MapGet("/products/validate", (HttpRequest request) =>
{
    var token = request.Cookies["auth_token"];
    if (string.IsNullOrEmpty(token))
    {
        return Results.Unauthorized();
    }

    var tokenHandler = new JwtSecurityTokenHandler();

    try
    {
        tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtParams:Url"], // Change to your issuer
            ValidAudience = builder.Configuration["JwtParams:Url"], // Change to your audience
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your_super_long_secret_key_that_is_32_chars")) // Secret Key
        }, out SecurityToken validatedToken);

        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        Console.WriteLine("JWT validation failed: " + ex.Message);
        return Results.Unauthorized();
    }
});

app.MapPost("/logout", (CookieHelper cookieHelper, HttpResponse response) =>
{
    cookieHelper.RemoveCookie("auth_token");
    return Results.Ok(new { message = "Logged out" });
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

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    c.RoutePrefix = ""; // this makes Swagger available at http://host:port/
});


//app.UseHttpsRedirection();

app.Run();
