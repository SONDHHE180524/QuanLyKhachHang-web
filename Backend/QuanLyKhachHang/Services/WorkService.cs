using Microsoft.EntityFrameworkCore;
using QuanLyKhachHang.DTOs;
using QuanLyKhachHang.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyKhachHang.Services;

public interface IWorkService
{
    Task<IEnumerable<WorkLogDto>> GetWorkLogsAsync(DateTime? from = null, DateTime? to = null);
    Task<bool> CheckInAsync(CheckInRequest request);
}

public class WorkService : IWorkService
{
    private readonly QuanLyCuaHangDbContext context;

    public WorkService(QuanLyCuaHangDbContext context)
    {
        this.context = context;
        // Tự động thêm cột nếu chưa có để tránh lỗi 500
        try {
            context.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'NhatKyCongViec' AND COLUMN_NAME = 'HinhThucThanhToan') BEGIN ALTER TABLE NhatKyCongViec ADD HinhThucThanhToan NVARCHAR(50) NULL END");
            context.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'NhatKyCongViec' AND COLUMN_NAME = 'IsConsultedByPA') BEGIN ALTER TABLE NhatKyCongViec ADD IsConsultedByPA BIT NULL END");
            context.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'NhatKyCongViec' AND COLUMN_NAME = 'TenNhanVienSale') BEGIN ALTER TABLE NhatKyCongViec ADD TenNhanVienSale NVARCHAR(200) NULL END");
        } catch (Exception ex) { 
            Console.WriteLine("DB Migration Error: " + ex.Message);
        }
    }

    public async Task<IEnumerable<WorkLogDto>> GetWorkLogsAsync(DateTime? from = null, DateTime? to = null)
    {
        var query = context.NhatKyCongViecs.AsQueryable();
        
        if (from.HasValue)
        {
            query = query.Where(x => x.NgayThucHien >= from.Value);
        }
        
        if (to.HasValue)
        {
            // Lọc đến hết ngày (nhỏ hơn ngày tiếp theo)
            var nextDay = to.Value.Date.AddDays(1);
            query = query.Where(x => x.NgayThucHien < nextDay);
        }

        var logs = await query
            .AsNoTracking()
            .Include(x => x.MaKhachHangNavigation)
            .Include(x => x.MaDichVuNavigation)
            .OrderByDescending(x => x.NgayThucHien)
            .ToListAsync();

        // Lấy danh sách các ngày có trong logs
        var dates = logs
            .Where(x => x.NgayThucHien.HasValue)
            .Select(x => x.NgayThucHien.Value.Date)
            .Distinct()
            .ToList();
        
        // Lấy tổng doanh thu thực tế (từ GiaoDich) cho các ngày này
        var dailyTotals = new Dictionary<DateTime, decimal>();
        if (dates.Any()) {
            var transactions = await context.GiaoDiches
                .Where(g => g.NgayGiaoDich.HasValue)
                .ToListAsync();
            
            dailyTotals = transactions
                .Where(g => g.NgayGiaoDich.HasValue && dates.Contains(g.NgayGiaoDich.Value.Date))
                .GroupBy(g => g.NgayGiaoDich.Value.Date)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.ThucThu ?? 0));
        }

        // Tải tổng nợ của các khách hàng để hiển thị cảnh báo nợ trong nhật ký công việc
        var customerDebts = await context.GiaoDiches
            .Where(g => g.MaKhachHang.HasValue)
            .GroupBy(g => g.MaKhachHang.Value)
            .Select(g => new { CustomerId = g.Key, TotalDebt = g.Sum(x => x.SoTienNo ?? 0) })
            .ToDictionaryAsync(x => x.CustomerId, x => x.TotalDebt);

        return logs.Select(x => new WorkLogDto
        (
            x.Id,
            x.NgayThucHien,
            x.MaKhachHang,
            x.TenKhachHang,
            x.MaDichVu,
            x.TenDichVu,
            x.LaLieuTrinh,
            x.LaLieuTrinh == true ? 0 : (x.MaDichVuNavigation != null ? x.MaDichVuNavigation.GiaBuoiLe ?? 0 : 0),
            x.GhiChu,
            x.IsConsultedByPA ?? false,
            x.HinhThucThanhToan,
            x.MaKhachHang.HasValue && customerDebts.ContainsKey(x.MaKhachHang.Value) ? customerDebts[x.MaKhachHang.Value] : 0,
            x.NgayThucHien.HasValue && dailyTotals.ContainsKey(x.NgayThucHien.Value.Date) ? dailyTotals[x.NgayThucHien.Value.Date] : 0,
            x.TenNhanVienSale
        ));
    }

    public async Task<bool> CheckInAsync(CheckInRequest request)
    {
        // Khóa không cho phép ghi nhận ngày tương lai
        if (request.Date.HasValue && request.Date.Value > DateTime.Now.AddMinutes(5))
        {
            return false;
        }

        var customer = request.CustomerId.HasValue ? await context.NguoiDungs.FindAsync(request.CustomerId.Value) : null;
        var service = request.ServiceId.HasValue ? await context.DichVus.FindAsync(request.ServiceId.Value) : null;

        // Nếu có CustomerId mà không tìm thấy khách thì lỗi
        if (request.CustomerId.HasValue && customer == null)
            return false;
        
        // Nếu không có CustomerId (Khách lẻ) thì bắt buộc phải là dịch vụ lẻ và có thông tin dịch vụ
        if (!request.CustomerId.HasValue && (request.IsTreatment || service == null))
            return false;
        
        // Nếu là khách có sẵn nhưng không phải làm liệu trình thì cũng phải có dịch vụ lẻ
        if (request.CustomerId.HasValue && !request.IsTreatment && service == null)
            return false;

        // Record the work log
        var workLog = new NhatKyCongViec
        {
            MaKhachHang = request.CustomerId,
            TenKhachHang = request.CustomerName,
            MaDichVu = request.ServiceId,
            TenDichVu = request.ServiceName ?? "Liệu trình ẩn danh",
            LaLieuTrinh = request.IsTreatment,
            NgayThucHien = request.Date ?? DateTime.Now,
            GhiChu = request.Notes,
            HinhThucThanhToan = request.PaymentMethod,
            IsConsultedByPA = request.IsConsultedByPA,
            TenNhanVienSale = request.ConsultantName
        };
        context.NhatKyCongViecs.Add(workLog);

        if (request.IsTreatment && customer != null)
        {
            // Parse and increment the session count
            if (!string.IsNullOrEmpty(customer.TienDoLieuTrinh) && customer.TienDoLieuTrinh != "Chưa đăng ký")
            {
                var parts = customer.TienDoLieuTrinh.Split('-');
                if (parts.Length > 0)
                {
                    var progressParts = parts[0].Trim().Split('/');
                    if (progressParts.Length == 2 && int.TryParse(progressParts[0], out int current) && int.TryParse(progressParts[1], out int total))
                    {
                        if (current < total)
                        {
                            if (request.IsFreeSession != true)
                            {
                                current++;
                                var serviceNamePart = parts.Length > 1 ? string.Join("-", parts.Skip(1)).Trim() : (service?.TenDichVu ?? "Liệu trình ẩn danh");
                                customer.TienDoLieuTrinh = $"{current}/{total} - {serviceNamePart}";
                            }
                        }
                        else
                        {
                            return false; // Already completed
                        }
                    }
                }
            }
        }
        else if (!request.IsTreatment && service != null)
        {
            // Not a treatment, create a single session transaction
            var transaction = new GiaoDich
            {
                MaKhachHang = request.CustomerId,
                TenKhachHang = request.CustomerName,
                MaDichVu = request.ServiceId,
                TenMatHang = request.ServiceName ?? service.TenDichVu,
                LoaiHinh = "Service",
                TongTien = service.GiaBuoiLe,
                ThucThu = service.GiaBuoiLe,
                HinhThucThanhToan = request.PaymentMethod ?? "Tiền mặt",
                GhiChu = !string.IsNullOrEmpty(request.Notes) ? request.Notes : (request.CustomerId.HasValue ? "Check-in dịch vụ lẻ" : "Khách lẻ vãng lai"),
                IsConsultedByPA = request.IsConsultedByPA,
                TenNhanVienSale = request.ConsultantName,
                NgayGiaoDich = request.Date ?? DateTime.Now
            };
            context.GiaoDiches.Add(transaction);
        }

        await context.SaveChangesAsync();
        return true;
    }
}
