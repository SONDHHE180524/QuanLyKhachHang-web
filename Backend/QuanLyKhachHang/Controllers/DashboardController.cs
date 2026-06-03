using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyKhachHang.Core;
using QuanLyKhachHang.Models;
using QuanLyKhachHang.Services;

namespace QuanLyKhachHang.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetDashboardData([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var data = await dashboardService.GetDashboardDataAsync(from, to);
        return Ok(ApiResponse<DashboardDto>.SuccessResult(data));
    }
}
