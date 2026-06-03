using System;
using System.Collections.Generic;

namespace QuanLyKhachHang.Models;

public partial class DichVu
{
    public int MaDichVu { get; set; }

    public string TenDichVu { get; set; } = null!;

    public decimal? GiaBuoiLe { get; set; }

    public decimal? GiaTronGoi { get; set; }

    public bool? LieuTrinh { get; set; }

    public int? SoBuoiMacDinh { get; set; }

    public string? GhiChuDichVu { get; set; }

    public virtual ICollection<GiaoDich> GiaoDiches { get; set; } = new List<GiaoDich>();
}
