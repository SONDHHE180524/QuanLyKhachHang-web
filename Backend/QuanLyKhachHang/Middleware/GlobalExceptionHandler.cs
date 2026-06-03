using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using QuanLyKhachHang.Core;

namespace QuanLyKhachHang.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, 
        Exception exception, 
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        httpContext.Response.ContentType = "application/json";

        var response = ApiResponse<object>.FailureResult(
            "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
            new { detail = exception.Message } // In production, omit or obfuscate details
        );

        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}
