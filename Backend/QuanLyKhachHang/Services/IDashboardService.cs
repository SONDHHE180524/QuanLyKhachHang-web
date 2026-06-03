using System.Threading.Tasks;
using QuanLyKhachHang.Models;

namespace QuanLyKhachHang.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardDataAsync(DateTime? startDate = null, DateTime? endDate = null);
}
