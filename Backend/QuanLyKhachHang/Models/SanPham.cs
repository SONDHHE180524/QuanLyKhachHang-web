using System;
using System.Collections.Generic;

namespace QuanLyKhachHang.Models;

public partial class SanPham
{
    public int MaSanPham { get; set; }

    public string TenSanPham { get; set; } = null!;

    public decimal? DonGia { get; set; }
    
    public int? SoLuong { get; set; }

    public virtual ICollection<GiaoDich> GiaoDiches { get; set; } = new List<GiaoDich>();
}
