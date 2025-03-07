using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ProductsMangementAPI.Repository
{
    public class LoginRepository : ILoginRepository
    {
        public async Task<string> GenerateJwtToken(string username)
        {
            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("your_super_long_secret_key_that_is_32_chars"); // At least 32 characters

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new System.Security.Claims.ClaimsIdentity(new[]
                {
                new System.Security.Claims.Claim("sub", username)
            }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = "yourdomain.com",
                Audience = "yourdomain.com",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
