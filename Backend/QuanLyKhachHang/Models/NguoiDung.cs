using System;
using System.Collections.Generic;

namespace QuanLyKhachHang.Models;

public partial class NguoiDung
{
    public int MaNguoiDung { get; set; }

    public string TenDangNhap { get; set; } = null!;

    public string MatKhauHash { get; set; } = null!;

    public string HoTen { get; set; } = null!;

    public string? SoDienThoai { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public string? DiaChi { get; set; }

    public string VaiTro { get; set; } = null!;

    public string? TienDoLieuTrinh { get; set; }

    public DateTime? NgayTao { get; set; }

    public virtual ICollection<GiaoDich> GiaoDichMaKhachHangNavigations { get; set; } = new List<GiaoDich>();

    public virtual ICollection<GiaoDich> GiaoDichMaNhanVienSaleNavigations { get; set; } = new List<GiaoDich>();

    public virtual ICollection<GiaoDich> GiaoDichMaNhanVienThucHienNavigations { get; set; } = new List<GiaoDich>();
}
