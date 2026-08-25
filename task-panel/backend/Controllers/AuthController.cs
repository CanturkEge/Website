using Microsoft.AspNetCore.Mvc;using TaskPanel.Api.Models;using TaskPanel.Api.Services;
namespace TaskPanel.Api.Controllers;
[ApiController,Route("api/auth")]public class AuthController(SupabaseAuthService auth):ControllerBase{[HttpPost("login")]public async Task<IActionResult> Login(LoginRequest request){var result=await auth.LoginAsync(request);return result is null?Unauthorized(new{message="E-posta veya şifre hatalı."}):Ok(result);}}
