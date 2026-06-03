using Microsoft.EntityFrameworkCore;
using QuanLyKhachHang.DTOs;
using QuanLyKhachHang.Models;

namespace QuanLyKhachHang.Services;

public interface ITransactionService
{
    Task<IEnumerable<TransactionDto>> GetTransactionsAsync(int count = 50);
    Task<TransactionDto> CreateTransactionAsync(CreateTransactionRequest request);
    Task<IEnumerable<ExpenseDto>> GetExpensesAsync();
    Task<ExpenseDto> CreateExpenseAsync(CreateExpenseRequest request);
}

public class TransactionService : ITransactionService
{
    private readonly QuanLyCuaHangDbContext context;

    public TransactionService(QuanLyCuaHangDbContext context)
    {
        this.context = context;
        try
        {
            context.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'GiaoDich' AND COLUMN_NAME = 'IsConsultedByPA') BEGIN ALTER TABLE GiaoDich ADD IsConsultedByPA BIT NULL END");
        }
        catch { }
    }

    public async Task<IEnumerable<TransactionDto>> GetTransactionsAsync(int count = 50)
    {
        return await context.GiaoDiches
            .AsNoTracking()
            .OrderByDescending(g => g.NgayGiaoDich)
            .Take(count)
            .Select(g => new TransactionDto
            {
                Id = g.MaGiaoDich,
                Date = g.NgayGiaoDich,
                CustomerName = g.TenKhachHang ?? "Khách lẻ",
                ItemName = g.TenMatHang ?? "Không xác định",
                Type = g.LoaiHinh ?? "Khác",
                TotalAmount = g.TongTien ?? 0,
                PaidAmount = g.ThucThu ?? 0,
                Debt = g.SoTienNo ?? 0,
                Status = (g.SoTienNo ?? 0) <= 0 ? "Completed" : "Pending",
                Notes = g.GhiChu,
                IsConsultedByPA = g.IsConsultedByPA ?? false,
                PaymentMethod = g.HinhThucThanhToan,
                ConsultantName = g.TenNhanVienSale
            })
            .ToListAsync();
    }

    public async Task<TransactionDto> CreateTransactionAsync(CreateTransactionRequest request)
    {
        var soTienNo = request.TotalAmount - request.PaidAmount;
        var transaction = new GiaoDich
        {
            MaKhachHang = request.CustomerId,
            TenKhachHang = request.CustomerName,
            MaSanPham = request.ProductId,
            MaDichVu = request.ServiceId,
            TenMatHang = request.ItemName,
            LoaiHinh = request.Type,
            TongTien = request.TotalAmount,
            ThucThu = request.PaidAmount,
            SoTienNo = soTienNo > 0 ? soTienNo : 0,
            HinhThucThanhToan = request.PaymentMethod,
            GhiChu = request.Notes,
            IsConsultedByPA = request.IsConsultedByPA,
            TenNhanVienSale = request.ConsultantName,
            NgayGiaoDich = DateTime.Now
        };

        context.GiaoDiches.Add(transaction);

        if (request.IsTreatmentPackage && request.CustomerId.HasValue && request.ServiceId.HasValue)
        {
            var customer = await context.NguoiDungs.FindAsync(request.CustomerId.Value);
            var service = await context.DichVus.FindAsync(request.ServiceId.Value);

            if (customer != null && service != null && service.SoBuoiMacDinh.HasValue)
            {
                customer.TienDoLieuTrinh = $"0/{service.SoBuoiMacDinh.Value} - {service.TenDichVu}";
            }
        }

        // Handle Product Inventory subtraction
        if (request.Type == "Product" && request.ProductId.HasValue)
        {
            var product = await context.SanPhams.FindAsync(request.ProductId.Value);
            if (product != null && product.SoLuong > 0)
            {
                // Defaulting to 1 since there's no Quantity in request right now
                product.SoLuong--;
            }
        }

        // Tự động ghi nhận vào Nhật ký công việc nếu là bán Dịch vụ lẻ
        if (request.Type == "Service" && !request.IsTreatmentPackage)
        {
            var workLog = new NhatKyCongViec
            {
                MaKhachHang = request.CustomerId,
                TenKhachHang = request.CustomerName,
                MaDichVu = request.ServiceId,
                TenDichVu = request.ItemName ?? "Dịch vụ lẻ",
                LaLieuTrinh = false,
                NgayThucHien = DateTime.Now,
                GhiChu = request.Notes ?? "Khách làm dịch vụ lẻ",
                HinhThucThanhToan = request.PaymentMethod,
                IsConsultedByPA = request.IsConsultedByPA
            };
            context.NhatKyCongViecs.Add(workLog);
        }

        await context.SaveChangesAsync();

        return new TransactionDto
        {
            Id = transaction.MaGiaoDich,
            Date = transaction.NgayGiaoDich,
            CustomerName = transaction.TenKhachHang ?? "Khách lẻ",
            ItemName = transaction.TenMatHang ?? "Không xác định",
            Type = transaction.LoaiHinh ?? "Khác",
            TotalAmount = transaction.TongTien ?? 0,
            PaidAmount = transaction.ThucThu ?? 0,
            Debt = transaction.SoTienNo ?? 0,
            Status = (transaction.SoTienNo ?? 0) <= 0 ? "Completed" : "Pending",
            Notes = transaction.GhiChu,
            IsConsultedByPA = transaction.IsConsultedByPA ?? false,
            PaymentMethod = transaction.HinhThucThanhToan,
            ConsultantName = transaction.TenNhanVienSale
        };
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesAsync()
    {
        return await context.ChiTieus
            .OrderByDescending(c => c.NgayChi)
            .Select(c => new ExpenseDto(c.MaChiTieu, c.NgayChi, c.NoiDungChi, c.SoTien))
            .ToListAsync();
    }

    public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseRequest request)
    {
        var expense = new ChiTieu
        {
            NoiDungChi = request.Content,
            SoTien = request.Amount,
            NgayChi = DateOnly.FromDateTime(DateTime.Now)
        };

        context.ChiTieus.Add(expense);
        await context.SaveChangesAsync();

        return new ExpenseDto(expense.MaChiTieu, expense.NgayChi, expense.NoiDungChi, expense.SoTien);
    }
}
