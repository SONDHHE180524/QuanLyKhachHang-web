using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhachHang.DTOs;
using QuanLyKhachHang.Models;
using QuanLyKhachHang.Services;
using QuanLyKhachHang.Core;

namespace QuanLyKhachHang.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize]
public class WorkController(IWorkService workService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWorkLogs([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var logs = await workService.GetWorkLogsAsync(from, to);
        return Ok(ApiResponse<IEnumerable<WorkLogDto>>.SuccessResult(logs));
    }

    [HttpPost("checkin")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
    {
        var result = await workService.CheckInAsync(request);
        if (result)
            return Ok(new ApiResponse<string> { Success = true, Message = "Check-in thành công" });
        
        return BadRequest(new ApiResponse<string> { Success = false, Message = "Check-in thất bại hoặc liệu trình đã kết thúc" });
    }
}
