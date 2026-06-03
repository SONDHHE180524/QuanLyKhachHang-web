using System;

namespace QuanLyKhachHang.Models;

public partial class NhatKyCongViec
{
    public int Id { get; set; }
    public DateTime? NgayThucHien { get; set; }
    public int? MaKhachHang { get; set; }
    public string? TenKhachHang { get; set; }
    public int? MaDichVu { get; set; }
    public string? TenDichVu { get; set; }
    public bool? LaLieuTrinh { get; set; }
    public string? GhiChu { get; set; }
    public string? HinhThucThanhToan { get; set; }
    public bool? IsConsultedByPA { get; set; }
    public string? TenNhanVienSale { get; set; }

    public virtual NguoiDung? MaKhachHangNavigation { get; set; }
    public virtual DichVu? MaDichVuNavigation { get; set; }
}
