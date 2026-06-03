using Microsoft.EntityFrameworkCore;
using QuanLyKhachHang.DTOs;
using QuanLyKhachHang.Models;

namespace QuanLyKhachHang.Services;

public interface IManagementService
{
    // Customers
    Task<IEnumerable<CustomerDto>> GetCustomersAsync();
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request);
    Task<CustomerDto?> UpdateCustomerAsync(int id, CreateCustomerRequest request);
    Task<bool> DeleteCustomerAsync(int id);
    
    // Services
    Task<IEnumerable<ServiceDto>> GetServicesAsync();
    Task<ServiceDto> CreateServiceAsync(CreateServiceRequest request);
    Task<ServiceDto?> UpdateServiceAsync(int id, CreateServiceRequest request);
    Task<bool> DeleteServiceAsync(int id);
    
    // Products
    Task<IEnumerable<ProductDto>> GetProductsAsync();
    Task<ProductDto> CreateProductAsync(CreateProductRequest request);
    Task<ProductDto?> UpdateProductAsync(int id, CreateProductRequest request);
    Task<bool> DeleteProductAsync(int id);

    // Debt
    Task<IEnumerable<CustomerDebtDto>> GetDebtListAsync();
    Task<IEnumerable<TransactionDto>> GetCustomerUnpaidTransactionsAsync(int? customerId, string customerName);
    Task<bool> PayDebtAsync(PayDebtRequest request);
    Task<bool> FinishTreatmentAsync(int customerId);
    Task<RefundCalculationDto?> CalculateRefundAsync(int customerId);
    Task<bool> ProcessRefundAsync(int customerId, ProcessRefundRequest request);
    Task<IEnumerable<TransactionDto>> GetRefundListAsync();
}

public class ManagementService(QuanLyCuaHangDbContext context) : IManagementService
{
    public async Task<IEnumerable<CustomerDto>> GetCustomersAsync()
    {
        return await context.NguoiDungs
            .Where(u => u.VaiTro.ToLower() == "khachhang")
            .OrderByDescending(u => u.NgayTao)
            .Select(u => new CustomerDto(
                u.MaNguoiDung,
                u.HoTen,
                u.SoDienThoai,
                u.DiaChi,
                u.TienDoLieuTrinh,
                u.NgayTao
            ))
            .ToListAsync();
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request)
    {
        var customer = new NguoiDung
        {
            HoTen = request.FullName,
            SoDienThoai = request.PhoneNumber,
            DiaChi = request.Address,
            VaiTro = "KhachHang",
            TenDangNhap = "kh_" + Guid.NewGuid().ToString("N").Substring(0, 8),
            MatKhauHash = "dynamic_customer_no_pass",
            NgayTao = DateTime.Now
        };

        context.NguoiDungs.Add(customer);
        await context.SaveChangesAsync();

        return new CustomerDto(
            customer.MaNguoiDung,
            customer.HoTen,
            customer.SoDienThoai,
            customer.DiaChi,
            customer.TienDoLieuTrinh,
            customer.NgayTao
        );
    }

    public async Task<CustomerDto?> UpdateCustomerAsync(int id, CreateCustomerRequest request)
    {
        var customer = await context.NguoiDungs.FindAsync(id);
        if (customer == null || customer.VaiTro != "KhachHang") return null;

        customer.HoTen = request.FullName;
        customer.SoDienThoai = request.PhoneNumber;
        customer.DiaChi = request.Address;

        await context.SaveChangesAsync();

        return new CustomerDto(
            customer.MaNguoiDung,
            customer.HoTen,
            customer.SoDienThoai,
            customer.DiaChi,
            customer.TienDoLieuTrinh,
            customer.NgayTao
        );
    }

    public async Task<bool> DeleteCustomerAsync(int id)
    {
        var customer = await context.NguoiDungs.FindAsync(id);
        if (customer == null || customer.VaiTro != "KhachHang") return false;

        context.NguoiDungs.Remove(customer);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<ServiceDto>> GetServicesAsync()
    {
        return await context.DichVus
            .Select(d => new ServiceDto(
                d.MaDichVu,
                d.TenDichVu ?? "Dịch vụ không tên",
                d.GiaBuoiLe ?? 0,
                d.GiaTronGoi ?? 0,
                d.LieuTrinh ?? false,
                d.SoBuoiMacDinh ?? 1
            ))
            .ToListAsync();
    }

    public async Task<ServiceDto> CreateServiceAsync(CreateServiceRequest request)
    {
        var service = new DichVu
        {
            TenDichVu = request.Name,
            GiaBuoiLe = request.PriceSingle,
            GiaTronGoi = request.PricePackage,
            LieuTrinh = request.IsTreatment,
            SoBuoiMacDinh = request.DefaultSessions
        };

        context.DichVus.Add(service);
        await context.SaveChangesAsync();

        return new ServiceDto(
            service.MaDichVu,
            service.TenDichVu,
            service.GiaBuoiLe ?? 0,
            service.GiaTronGoi ?? 0,
            service.LieuTrinh ?? false,
            service.SoBuoiMacDinh ?? 1
        );
    }

    public async Task<ServiceDto?> UpdateServiceAsync(int id, CreateServiceRequest request)
    {
        var service = await context.DichVus.FindAsync(id);
        if (service == null) return null;

        service.TenDichVu = request.Name;
        service.GiaBuoiLe = request.PriceSingle;
        service.GiaTronGoi = request.PricePackage;
        service.LieuTrinh = request.IsTreatment;
        service.SoBuoiMacDinh = request.DefaultSessions;

        await context.SaveChangesAsync();

        return new ServiceDto(
            service.MaDichVu,
            service.TenDichVu,
            service.GiaBuoiLe ?? 0,
            service.GiaTronGoi ?? 0,
            service.LieuTrinh ?? false,
            service.SoBuoiMacDinh ?? 1
        );
    }

    public async Task<bool> DeleteServiceAsync(int id)
    {
        var service = await context.DichVus.FindAsync(id);
        if (service == null) return false;

        context.DichVus.Remove(service);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<ProductDto>> GetProductsAsync()
    {
        return await context.SanPhams
            .Select(s => new ProductDto(
                s.MaSanPham,
                s.TenSanPham ?? "Sản phẩm không tên",
                s.DonGia ?? 0,
                s.SoLuong ?? 0
            ))
            .ToListAsync();
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductRequest request)
    {
        var product = new SanPham
        {
            TenSanPham = request.Name,
            DonGia = request.Price,
            SoLuong = request.Stock
        };

        context.SanPhams.Add(product);
        await context.SaveChangesAsync();

        return new ProductDto(
            product.MaSanPham,
            product.TenSanPham,
            product.DonGia ?? 0,
            product.SoLuong ?? 0
        );
    }

    public async Task<ProductDto?> UpdateProductAsync(int id, CreateProductRequest request)
    {
        var product = await context.SanPhams.FindAsync(id);
        if (product == null) return null;

        product.TenSanPham = request.Name;
        product.DonGia = request.Price;
        product.SoLuong = request.Stock;

        await context.SaveChangesAsync();

        return new ProductDto(
            product.MaSanPham,
            product.TenSanPham,
            product.DonGia ?? 0,
            product.SoLuong ?? 0
        );
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await context.SanPhams.FindAsync(id);
        if (product == null) return false;

        context.SanPhams.Remove(product);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<CustomerDebtDto>> GetDebtListAsync()
    {
        // First group by customer, summing TongTien - ThucThu across ALL their transactions (including negative-debt PayDebt transactions)
        var grouped = await context.GiaoDiches
            .GroupBy(g => new { g.MaKhachHang, CustomerName = g.TenKhachHang ?? "Khách lẻ" })
            .Select(group => new
            {
                group.Key.MaKhachHang,
                group.Key.CustomerName,
                PhoneNumber = group.Max(g => g.MaKhachHangNavigation != null ? g.MaKhachHangNavigation.SoDienThoai : null),
                TotalDebt = group.Sum(g => (g.TongTien ?? 0) - (g.ThucThu ?? 0)),
                LastTransactionDate = group.Max(g => g.NgayGiaoDich)
            })
            .Where(d => d.TotalDebt > 0)
            .ToListAsync();

        return grouped
            .Select(d => new CustomerDebtDto(
                d.MaKhachHang,
                d.CustomerName,
                d.PhoneNumber,
                d.TotalDebt,
                d.LastTransactionDate
            ))
            .OrderByDescending(d => d.TotalDebt)
            .ToList();
    }

    public async Task<IEnumerable<TransactionDto>> GetCustomerUnpaidTransactionsAsync(int? customerId, string customerName)
    {
        var query = context.GiaoDiches.AsQueryable();

        if (customerId.HasValue && customerId.Value > 0)
        {
            query = query.Where(g => g.MaKhachHang == customerId.Value);
        }
        else
        {
            query = query.Where(g => g.TenKhachHang == customerName);
        }

        return await query
            .Where(g => (g.TongTien ?? 0) - (g.ThucThu ?? 0) > 0 || g.LoaiHinh == "PayDebt")
            .OrderByDescending(g => g.NgayGiaoDich)
            .Select(g => new TransactionDto
            {
                Id = g.MaGiaoDich,
                Date = g.NgayGiaoDich,
                CustomerName = g.TenKhachHang ?? "Khách lẻ",
                ItemName = g.TenMatHang ?? "Không xác định",
                Type = g.LoaiHinh ?? "Khác",
                TotalAmount = g.TongTien ?? 0,
                PaidAmount = g.ThucThu ?? 0,
                Debt = (g.TongTien ?? 0) - (g.ThucThu ?? 0),
                Status = (g.TongTien ?? 0) - (g.ThucThu ?? 0) <= 0 ? "Completed" : "Pending",
                Notes = g.GhiChu,
                IsConsultedByPA = g.IsConsultedByPA ?? false,
                PaymentMethod = g.HinhThucThanhToan,
                ConsultantName = g.TenNhanVienSale
            })
            .ToListAsync();
    }

    public async Task<bool> PayDebtAsync(PayDebtRequest request)
    {
        var query = context.GiaoDiches.AsQueryable();

        if (request.CustomerId.HasValue && request.CustomerId.Value > 0)
        {
            query = query.Where(g => g.MaKhachHang == request.CustomerId.Value);
        }
        else
        {
            query = query.Where(g => g.TenKhachHang == request.CustomerName);
        }

        var totalDebt = await query.SumAsync(g => (g.TongTien ?? 0) - (g.ThucThu ?? 0));
        if (totalDebt <= 0) return false;

        // Create a new transaction representing the debt payment event
        var paymentTransaction = new GiaoDich
        {
            MaKhachHang = request.CustomerId,
            TenKhachHang = request.CustomerName,
            TenMatHang = "Thu nợ",
            LoaiHinh = "PayDebt",
            TongTien = 0,
            ThucThu = request.Amount,
            SoTienNo = 0,
            HinhThucThanhToan = request.PaymentMethod ?? "Tiền mặt",
            GhiChu = request.Notes ?? "Khách thanh toán nợ",
            NgayGiaoDich = DateTime.Now
        };
        context.GiaoDiches.Add(paymentTransaction);

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> FinishTreatmentAsync(int customerId)
    {
        var customer = await context.NguoiDungs.FindAsync(customerId);
        if (customer == null || customer.VaiTro != "KhachHang") return false;

        customer.TienDoLieuTrinh = "Chưa đăng ký";
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<RefundCalculationDto?> CalculateRefundAsync(int customerId)
    {
        var customer = await context.NguoiDungs.FindAsync(customerId);
        if (customer == null || string.IsNullOrEmpty(customer.TienDoLieuTrinh) || customer.TienDoLieuTrinh == "Chưa đăng ký")
            return null;

        var parts = customer.TienDoLieuTrinh.Split('-');
        if (parts.Length < 2) return null;

        var progressParts = parts[0].Trim().Split('/');
        if (progressParts.Length != 2) return null;

        if (!int.TryParse(progressParts[0], out int done) || !int.TryParse(progressParts[1], out int total))
            return null;

        string serviceName = string.Join("-", parts.Skip(1)).Trim();
        var service = await context.DichVus.FirstOrDefaultAsync(s => s.TenDichVu == serviceName);
        decimal singlePrice = service?.GiaBuoiLe ?? 0;
        decimal packagePrice = service?.GiaTronGoi ?? 0;

        var purchase = await context.GiaoDiches
            .Where(g => g.MaKhachHang == customerId && g.TenMatHang == serviceName && (g.LoaiHinh == "Service" || g.LoaiHinh == "Liệu trình"))
            .OrderByDescending(g => g.NgayGiaoDich)
            .FirstOrDefaultAsync();

        decimal totalCustomerDebt = await context.GiaoDiches
            .Where(g => g.MaKhachHang == customerId)
            .SumAsync(g => (g.TongTien ?? 0) - (g.ThucThu ?? 0));

        decimal paidAmount = (purchase?.TongTien ?? packagePrice) - (totalCustomerDebt > 0 ? totalCustomerDebt : 0);
        if (paidAmount < 0) paidAmount = 0;
        decimal usedCost = done * singlePrice;
        decimal refundAmount = paidAmount - usedCost;

        return new RefundCalculationDto(
            customer.HoTen,
            serviceName,
            done,
            total,
            singlePrice,
            packagePrice,
            paidAmount,
            usedCost,
            refundAmount > 0 ? refundAmount : 0
        );
    }

    public async Task<bool> ProcessRefundAsync(int customerId, ProcessRefundRequest request)
    {
        var customer = await context.NguoiDungs.FindAsync(customerId);
        if (customer == null || customer.VaiTro != "KhachHang") return false;

        string oldProgress = customer.TienDoLieuTrinh ?? "N/A";
        customer.TienDoLieuTrinh = "Chưa đăng ký";

        // Create a refund transaction
        var refundTransaction = new GiaoDich
        {
            MaKhachHang = customerId,
            TenKhachHang = customer.HoTen,
            TenMatHang = $"Hoàn tiền: {oldProgress}",
            LoaiHinh = "Refund",
            TongTien = -request.RefundAmount, // Record as negative total
            ThucThu = -request.RefundAmount, // Record as negative actual
            NgayGiaoDich = DateTime.Now,
            GhiChu = request.Notes ?? "Dừng liệu trình sớm và hoàn tiền"
        };

        context.GiaoDiches.Add(refundTransaction);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<TransactionDto>> GetRefundListAsync()
    {
        return await context.GiaoDiches
            .Where(g => g.LoaiHinh == "Refund")
            .OrderByDescending(g => g.NgayGiaoDich)
            .Select(g => new TransactionDto
            {
                Id = g.MaGiaoDich,
                Date = g.NgayGiaoDich,
                CustomerName = g.TenKhachHang ?? "Khách lẻ",
                ItemName = g.TenMatHang ?? "Không xác định",
                Type = g.LoaiHinh ?? "Khác",
                TotalAmount = Math.Abs(g.TongTien ?? 0),
                PaidAmount = Math.Abs(g.ThucThu ?? 0),
                Debt = 0,
                Status = "Success",
                Notes = null,
                IsConsultedByPA = false,
                PaymentMethod = g.HinhThucThanhToan,
                ConsultantName = g.TenNhanVienSale
            })
            .ToListAsync();
    }
}
