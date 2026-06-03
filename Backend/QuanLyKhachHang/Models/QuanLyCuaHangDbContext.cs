using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhachHang.Models;

public partial class QuanLyCuaHangDbContext : DbContext
{
    public QuanLyCuaHangDbContext()
    {
    }

    public QuanLyCuaHangDbContext(DbContextOptions<QuanLyCuaHangDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ChiTieu> ChiTieus { get; set; }

    public virtual DbSet<DichVu> DichVus { get; set; }

    public virtual DbSet<GiaoDich> GiaoDiches { get; set; }

    public virtual DbSet<NguoiDung> NguoiDungs { get; set; }

    public virtual DbSet<SanPham> SanPhams { get; set; }

    public virtual DbSet<NhatKyCongViec> NhatKyCongViecs { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChiTieu>(entity =>
        {
            entity.HasKey(e => e.MaChiTieu).HasName("PK__ChiTieu__CDF0A11778D2EEAF");

            entity.ToTable("ChiTieu");

            entity.Property(e => e.NgayChi).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.NoiDungChi).HasMaxLength(255);
            entity.Property(e => e.SoTien).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<DichVu>(entity =>
        {
            entity.HasKey(e => e.MaDichVu).HasName("PK__DichVu__C0E6DE8F71B5D87C");

            entity.ToTable("DichVu");

            entity.Property(e => e.GiaBuoiLe)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GiaTronGoi)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.LieuTrinh).HasDefaultValue(false);
            entity.Property(e => e.SoBuoiMacDinh).HasDefaultValue(1);
            entity.Property(e => e.TenDichVu).HasMaxLength(100);
        });

        modelBuilder.Entity<GiaoDich>(entity =>
        {
            entity.HasKey(e => e.MaGiaoDich).HasName("PK__GiaoDich__0A2A24EBE9429492");

            entity.ToTable("GiaoDich", tb => tb.HasTrigger("trg_CapNhatTienDoTuDong"));

            entity.Property(e => e.HinhThucThanhToan).HasMaxLength(50);
            entity.Property(e => e.LoaiHinh).HasMaxLength(50);
            entity.Property(e => e.NgayGiaoDich)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoTienNo)
                .HasComputedColumnSql("([TongTien]-[ThucThu])", false)
                .HasColumnType("decimal(19, 2)");
            entity.Property(e => e.TenKhachHang).HasMaxLength(100);
            entity.Property(e => e.TenMatHang).HasMaxLength(255);
            entity.Property(e => e.TenNhanVienSale).HasMaxLength(100);
            entity.Property(e => e.TenNhanVienThucHien).HasMaxLength(100);
            entity.Property(e => e.ThucThu)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TongTien)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");

            entity.Property(e => e.IsConsultedByPA).HasDefaultValue(false);
            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.GiaoDiches)
                .HasForeignKey(d => d.MaDichVu)
                .HasConstraintName("FK__GiaoDich__MaDich__5AEE82B9");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.GiaoDichMaKhachHangNavigations)
                .HasForeignKey(d => d.MaKhachHang)
                .HasConstraintName("FK__GiaoDich__MaKhac__59063A47");

            entity.HasOne(d => d.MaNhanVienSaleNavigation).WithMany(p => p.GiaoDichMaNhanVienSaleNavigations)
                .HasForeignKey(d => d.MaNhanVienSale)
                .HasConstraintName("FK__GiaoDich__MaNhan__5BE2A6F2");

            entity.HasOne(d => d.MaNhanVienThucHienNavigation).WithMany(p => p.GiaoDichMaNhanVienThucHienNavigations)
                .HasForeignKey(d => d.MaNhanVienThucHien)
                .HasConstraintName("FK__GiaoDich__MaNhan__5CD6CB2B");

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.GiaoDiches)
                .HasForeignKey(d => d.MaSanPham)
                .HasConstraintName("FK__GiaoDich__MaSanP__59FA5E80");
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PK__NguoiDun__C539D762D714BC45");

            entity.ToTable("NguoiDung");

            entity.HasIndex(e => e.SoDienThoai, "UQ__NguoiDun__0389B7BD290B2F90").IsUnique();

            entity.HasIndex(e => e.TenDangNhap, "UQ__NguoiDun__55F68FC02E9EE42F").IsUnique();

            entity.Property(e => e.DiaChi).HasMaxLength(255);
            entity.Property(e => e.HoTen).HasMaxLength(100);
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.TenDangNhap)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.TienDoLieuTrinh)
                .HasMaxLength(100)
                .HasDefaultValue("Chưa đăng ký");
            entity.Property(e => e.VaiTro).HasMaxLength(50);
        });

        modelBuilder.Entity<SanPham>(entity =>
        {
            entity.HasKey(e => e.MaSanPham).HasName("PK__SanPham__FAC7442DE7BF3480");

            entity.ToTable("SanPham");

            entity.Property(e => e.DonGia)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TenSanPham).HasMaxLength(100);
        });

        modelBuilder.Entity<NhatKyCongViec>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_NhatKyCongViec");
            entity.ToTable("NhatKyCongViec");
            
            entity.Property(e => e.NgayThucHien).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.TenKhachHang).HasMaxLength(100);
            entity.Property(e => e.TenDichVu).HasMaxLength(100);
            entity.Property(e => e.LaLieuTrinh).HasDefaultValue(false);
            entity.Property(e => e.GhiChu).HasMaxLength(255);
            entity.Property(e => e.HinhThucThanhToan).HasMaxLength(50);
            entity.Property(e => e.IsConsultedByPA).HasDefaultValue(false);

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany()
                .HasForeignKey(d => d.MaKhachHang)
                .HasConstraintName("FK_NhatKyCongViec_KhachHang");

            entity.HasOne(d => d.MaDichVuNavigation).WithMany()
                .HasForeignKey(d => d.MaDichVu)
                .HasConstraintName("FK_NhatKyCongViec_DichVu");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
