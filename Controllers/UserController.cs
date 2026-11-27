using InventoryManagement.Code;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InventoryManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        [Route("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> Current()
        {
            string? userID = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            AppUser? appUser = !string.IsNullOrEmpty(userID) ?
                SystemData.AppUsers.FirstOrDefault(x => x.ID == int.Parse(userID)) : null;

            return Json(appUser);
        }

        [Route("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> LogIn(int id)
        {
            AppUser? appUser = SystemData.AppUsers.FirstOrDefault(x => x.ID == id);
            if (appUser == null)
            {
                return BadRequest("Invalid user ID");
            }

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, id.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                new AuthenticationProperties());
            
            return Json(appUser);
        }

        [Route("[action]")]
        public async Task<IActionResult> LogOut()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok();
        }
    }
}
