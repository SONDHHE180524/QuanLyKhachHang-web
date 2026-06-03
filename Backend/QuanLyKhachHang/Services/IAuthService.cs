using QuanLyKhachHang.DTOs;

namespace QuanLyKhachHang.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<bool> RegisterAsync(RegisterRequest request);
}
