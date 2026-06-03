using System;
using System.Collections.Generic;

namespace QuanLyKhachHang.Models;

public partial class ChiTieu
{
    public int MaChiTieu { get; set; }

    public DateOnly? NgayChi { get; set; }

    public string NoiDungChi { get; set; } = null!;

    public decimal SoTien { get; set; }
}
