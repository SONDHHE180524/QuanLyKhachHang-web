using Microsoft.AspNetCore.Mvc;
using QuanLyKhachHang.Core;
using QuanLyKhachHang.DTOs;
using QuanLyKhachHang.Services;

namespace QuanLyKhachHang.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        
        if (result == null)
            return Unauthorized(ApiResponse<object>.FailureResult("Tên đăng nhập hoặc mật khẩu không chính xác."));

        return Ok(ApiResponse<AuthResponse>.SuccessResult(result, "Đăng nhập thành công."));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var success = await authService.RegisterAsync(request);
        
        if (!success)
            return BadRequest(ApiResponse<object>.FailureResult("Tên đăng nhập đã tồn tại hoặc đăng ký thất bại."));

        return Ok(ApiResponse<object>.SuccessResult(new { }, "Đăng ký thành công."));
    }
}
