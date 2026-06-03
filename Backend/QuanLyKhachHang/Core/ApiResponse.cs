namespace QuanLyKhachHang.Core;

public record ApiResponse<T>
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public T? Data { get; init; }
    public object? Errors { get; init; }

    public static ApiResponse<T> SuccessResult(T data, string? message = null) => 
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> FailureResult(string message, object? errors = null) => 
        new() { Success = false, Message = message, Errors = errors };
}
