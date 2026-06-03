using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuanLyKhachHang.DTOs;
using QuanLyKhachHang.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace QuanLyKhachHang.Services;

public class AuthService(QuanLyCuaHangDbContext context, IConfiguration configuration) : IAuthService
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await context.NguoiDungs
            .FirstOrDefaultAsync(u => u.TenDangNhap == request.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.MatKhauHash))
            return null;

        var token = GenerateJwtToken(user);

        return new AuthResponse(
            user.MaNguoiDung,
            user.TenDangNhap,
            user.HoTen,
            user.VaiTro,
            token
        );
    }

    public async Task<bool> RegisterAsync(RegisterRequest request)
    {
        if (await context.NguoiDungs.AnyAsync(u => u.TenDangNhap == request.Username))
            return false;

        var user = new NguoiDung
        {
            TenDangNhap = request.Username,
            MatKhauHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            HoTen = request.FullName,
            SoDienThoai = request.PhoneNumber,
            VaiTro = request.Role,
            NgayTao = DateTime.Now
        };

        context.NguoiDungs.Add(user);
        return await context.SaveChangesAsync() > 0;
    }

    private string GenerateJwtToken(NguoiDung user)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.MaNguoiDung.ToString()),
            new Claim(ClaimTypes.Name, user.TenDangNhap),
            new Claim(ClaimTypes.Role, user.VaiTro)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["DurationInMinutes"]!)),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
