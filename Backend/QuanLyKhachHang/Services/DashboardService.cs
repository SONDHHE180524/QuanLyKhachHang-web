using Microsoft.EntityFrameworkCore;
using QuanLyKhachHang.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyKhachHang.Services;

public class DashboardService(QuanLyCuaHangDbContext context) : IDashboardService
{

    public async Task<DashboardDto> GetDashboardDataAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var now = DateTime.Now;
        var start = startDate ?? new DateTime(now.Year, now.Month, 1);
        var end = (endDate ?? now).Date.AddDays(1).AddTicks(-1);

        // 1. Tính toán các tổng số
        var allTransactions = await context.GiaoDiches
            .Where(g => g.NgayGiaoDich >= start && g.NgayGiaoDich <= end)
            .ToListAsync();
        
        var totalServiceRevenue = allTransactions
            .Where(g => g.LoaiHinh == "Service" || g.LoaiHinh == "Package" || g.LoaiHinh == "Liệu trình")
            .Sum(g => g.ThucThu ?? 0);
            
        var totalProductRevenue = allTransactions
            .Where(g => g.LoaiHinh == "Product")
            .Sum(g => g.ThucThu ?? 0);
            
        var totalRefundAmount = allTransactions
            .Where(g => g.LoaiHinh == "Refund")
            .Sum(g => Math.Abs(g.ThucThu ?? 0));

        var monthlyExpense = await context.ChiTieus
            .Where(c => c.NgayChi != null && c.NgayChi >= DateOnly.FromDateTime(start) && c.NgayChi <= DateOnly.FromDateTime(end))
            .SumAsync(c => c.SoTien);
            
        var netProfit = (totalServiceRevenue + totalProductRevenue) - (monthlyExpense + totalRefundAmount);
        
        var totalDebt = allTransactions.Sum(g => g.SoTienNo ?? 0);

        // 2. Dữ liệu biểu đồ cột (Tự động chuyển giữa Ngày và Tháng tùy theo bộ lọc)
        var barChartData = new List<DailyRevenueDto>();
        var dateDiff = (end - start).TotalDays;

        if (dateDiff <= 31)
        {
            // Hiển thị theo ngày trong khoảng bộ lọc
            for (var date = start.Date; date <= end.Date; date = date.AddDays(1))
            {
                var dayRevenue = allTransactions
                    .Where(g => g.NgayGiaoDich?.Date == date)
                    .Sum(g => g.ThucThu ?? 0);

                barChartData.Add(new DailyRevenueDto { 
                    Day = date.ToString("dd/MM"), 
                    Revenue = dayRevenue 
                });
            }
        }
        else
        {
            // Hiển thị theo tháng trong năm của ngày bắt đầu
            var reportYear = start.Year;
            var startOfReportYear = new DateTime(reportYear, 1, 1);
            var endOfReportYear = new DateTime(reportYear, 12, 31, 23, 59, 59);

            var yearlyTransactions = await context.GiaoDiches
                .Where(g => g.NgayGiaoDich >= startOfReportYear && g.NgayGiaoDich <= endOfReportYear)
                .ToListAsync();

            string[] labels = { "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12" };
            for (int i = 1; i <= 12; i++)
            {
                var monthRevenue = yearlyTransactions
                    .Where(g => g.NgayGiaoDich?.Month == i)
                    .Sum(g => g.ThucThu ?? 0);

                barChartData.Add(new DailyRevenueDto { Day = labels[i - 1], Revenue = monthRevenue });
            }
        }

        // 3. Cơ cấu dịch vụ (Service Distribution - Theo bộ lọc)
        var distribution = allTransactions
            .Where(g => !string.IsNullOrEmpty(g.LoaiHinh))
            .GroupBy(g => g.LoaiHinh)
            .Select(g => new ServiceDistributionDto
            {
                Label = g.Key!,
                Count = g.Count()
            })
            .ToList();

        int totalTransactionCount = distribution.Sum(d => d.Count);
        string[] colors = { "bg-primary-500", "bg-secondary-400", "bg-cyan-400", "bg-amber-400", "bg-rose-400" };
        int colorIdx = 0;

        foreach (var d in distribution)
        {
            d.Percentage = totalTransactionCount > 0 ? Math.Round((double)d.Count / totalTransactionCount * 100, 1) : 0;
            d.Color = colors[colorIdx % colors.Length];
            colorIdx++;
        }

        // 4. Giao dịch gần nhất (Trong kỳ)
        var recentTransactions = allTransactions
            .OrderByDescending(g => g.NgayGiaoDich)
            .Take(5)
            .Select(g => new RecentTransactionDto
            {
                Id = g.MaGiaoDich,
                Date = g.NgayGiaoDich,
                CustomerName = g.TenKhachHang ?? "Khách lẻ",
                ItemName = g.TenMatHang ?? "Không xác định",
                Type = g.LoaiHinh ?? "Khác",
                Amount = g.TongTien ?? 0,
                Paid = g.ThucThu ?? 0,
                Debt = g.SoTienNo ?? 0,
                Status = (g.SoTienNo ?? 0) <= 0 ? "Completed" : "Pending"
            })
            .ToList();

        // 5. Tiến độ liệu trình (Customer Progress)
        var usersWithTreatment = await context.NguoiDungs
            .Include(u => u.GiaoDichMaKhachHangNavigations)
            .Where(u => u.VaiTro == "KhachHang" && !string.IsNullOrEmpty(u.TienDoLieuTrinh) && u.TienDoLieuTrinh != "Chưa đăng ký")
            .ToListAsync();

        var customerProgressList = new List<CustomerProgressDto>();
        foreach (var u in usersWithTreatment)
        {
            try
            {
                // Format is: "4/10 - Điều trị mụn"
                var parts = u.TienDoLieuTrinh.Split('-');
                if (parts.Length > 0)
                {
                    var progressStr = parts[0].Trim();
                    var serviceName = parts.Length > 1 ? string.Join("-", parts.Skip(1)).Trim() : "Liệu trình ẩn danh";
                    var progressParts = progressStr.Split('/');
                    if (progressParts.Length == 2 && int.TryParse(progressParts[0], out int current) && int.TryParse(progressParts[1], out int total))
                    {
                        var lastPackageTx = u.GiaoDichMaKhachHangNavigations
                            .Where(g => g.LoaiHinh == "Package" || g.TenMatHang == serviceName)
                            .OrderByDescending(g => g.NgayGiaoDich)
                            .FirstOrDefault();

                        customerProgressList.Add(new CustomerProgressDto
                        {
                            Id = u.MaNguoiDung,
                            Name = u.HoTen,
                            Service = serviceName,
                            CurrentSession = current,
                            TotalSessions = total,
                            LastUpdated = lastPackageTx?.NgayGiaoDich ?? DateTime.MinValue
                        });
                    }
                }
            }
            catch { }
        }

        // Sort: completed treatments go to bottom, then by last updated
        customerProgressList = customerProgressList
            .OrderBy(c => c.CurrentSession >= c.TotalSessions ? 1 : 0)
            .ThenByDescending(c => c.LastUpdated)
            .ToList();

        // 6. Danh sách khách hàng đã phục vụ trong kỳ
        var workLogsInPeriod = await context.NhatKyCongViecs
            .Where(w => w.NgayThucHien >= start && w.NgayThucHien <= end)
            .OrderByDescending(w => w.NgayThucHien)
            .Select(w => new CustomerServedDto
            {
                CustomerId = w.MaKhachHang,
                CustomerName = w.TenKhachHang ?? "Khách lẻ",
                ServiceName = w.TenDichVu ?? "Dịch vụ lẻ",
                Date = w.NgayThucHien ?? DateTime.Now,
                Revenue = 0, // Will be updated if transaction exists
                Type = w.LaLieuTrinh == true ? "Liệu trình" : "Lẻ"
            })
            .ToListAsync();

        // Gắn doanh thu từ giao dịch nếu có
        foreach (var log in workLogsInPeriod)
        {
            var tx = allTransactions.FirstOrDefault(t => t.TenKhachHang == log.CustomerName && t.TenMatHang == log.ServiceName && t.NgayGiaoDich?.Date == log.Date.Date);
            if (tx != null) log.Revenue = tx.ThucThu ?? 0;
        }

        return new DashboardDto
        {
            TotalRevenue = totalServiceRevenue + totalProductRevenue,
            ServiceRevenue = totalServiceRevenue,
            ProductRevenue = totalProductRevenue,
            RefundAmount = totalRefundAmount,
            MonthlyExpense = monthlyExpense,
            Profit = netProfit,
            Debt = totalDebt,
            BarChartData = barChartData,
            ServiceDistribution = distribution,
            RecentTransactions = recentTransactions,
            CustomerProgress = customerProgressList,
            CustomersServed = workLogsInPeriod
        };
    }
}
