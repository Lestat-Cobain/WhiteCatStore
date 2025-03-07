namespace ProductsMangementAPI.Repository
{
    public interface ILoginRepository
    {
        public Task<string> GenerateJwtToken(string username);
    }
}
