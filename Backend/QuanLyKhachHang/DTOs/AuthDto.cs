namespace QuanLyKhachHang.DTOs;

public record LoginRequest(string Username, string Password);

public record RegisterRequest(
    string Username, 
    string Password, 
    string FullName, 
    string Role, 
    string? PhoneNumber = null);

public record AuthResponse(
    int Id, 
    string Username, 
    string FullName, 
    string Role, 
    string Token);
