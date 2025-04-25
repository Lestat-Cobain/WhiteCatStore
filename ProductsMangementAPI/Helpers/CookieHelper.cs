namespace ProductsMangementAPI.Helpers
{
    /// <summary>
    /// Cookie management in http context
    /// </summary>
    public class CookieHelper
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CookieHelper(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Set cookies in http context
        /// </summary>
        /// <param name="name">Cookie name</param>
        /// <param name="value">Value of cookie</param>
        /// <param name="tokenExpirationDate">Token expiration date</param>
        public void SetCookie(string name, string value, DateTime tokenExpirationDate, int expirationMinutes)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None, //Required for CORS with AllowCredentials
                Expires = tokenExpirationDate,
                MaxAge = TimeSpan.FromMinutes(expirationMinutes),
                IsEssential = true,
            };

            _httpContextAccessor.HttpContext?.Response.Cookies.Append(name, value, cookieOptions);
        }

        /// <summary>
        /// Remove cookies in http context
        /// </summary>
        /// <param name="name">Cookie name</param>
        public void RemoveCookie(string name)
        {
            //Do not use the "delete" method because due to the "preflight" requests it leaves "cookies" active
            //_httpContextAccessor.HttpContext?.Response.Cookies.Delete(name);

            //Instead, delete the cookie by overwriting its contents and setting it to a past expiration date

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.Now.AddDays(-1) //Set date as expired
            };

            _httpContextAccessor.HttpContext?.Response.Cookies.Append(name, "", cookieOptions);
        }

        /// <summary>
        /// Get cookie content by name
        /// </summary>
        /// <param name="name">Cookie name</param>
        /// <returns>Returns the content of a cookie if it exists</returns>
        public string? GetCookieContent(string cookieName)
        {
            string? token = _httpContextAccessor.HttpContext?.Request.Cookies[cookieName];

            return token;
        }
    }
}
