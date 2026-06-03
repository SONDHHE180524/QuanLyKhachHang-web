using System;
using System.Collections.Generic;

namespace QuanLyKhachHang.Models;

public partial class GiaoDich
{
    public int MaGiaoDich { get; set; }

    public DateTime? NgayGiaoDich { get; set; }

    public int? MaKhachHang { get; set; }

    public string? TenKhachHang { get; set; }

    public int? MaSanPham { get; set; }

    public int? MaDichVu { get; set; }

    public string? TenMatHang { get; set; }

    public string? LoaiHinh { get; set; }

    public string? TenNhanVienSale { get; set; }

    public int? MaNhanVienSale { get; set; }

    public string? TenNhanVienThucHien { get; set; }

    public int? MaNhanVienThucHien { get; set; }

    public decimal? TongTien { get; set; }

    public decimal? ThucThu { get; set; }

    public decimal? SoTienNo { get; set; }

    public string? HinhThucThanhToan { get; set; }

    public string? GhiChu { get; set; }
    public bool? IsConsultedByPA { get; set; }

    public virtual DichVu? MaDichVuNavigation { get; set; }

    public virtual NguoiDung? MaKhachHangNavigation { get; set; }

    public virtual NguoiDung? MaNhanVienSaleNavigation { get; set; }

    public virtual NguoiDung? MaNhanVienThucHienNavigation { get; set; }

    public virtual SanPham? MaSanPhamNavigation { get; set; }
}
