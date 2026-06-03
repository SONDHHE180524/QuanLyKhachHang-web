using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyKhachHang.Migrations
{
    /// <inheritdoc />
    public partial class AddTenNhanVienSaleToWorkLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChiTieu",
                columns: table => new
                {
                    MaChiTieu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NgayChi = table.Column<DateOnly>(type: "date", nullable: true, defaultValueSql: "(getdate())"),
                    NoiDungChi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ChiTieu__CDF0A11778D2EEAF", x => x.MaChiTieu);
                });

            migrationBuilder.CreateTable(
                name: "DichVu",
                columns: table => new
                {
                    MaDichVu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenDichVu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GiaBuoiLe = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    GiaTronGoi = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    LieuTrinh = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    SoBuoiMacDinh = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    GhiChuDichVu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DichVu__C0E6DE8F71B5D87C", x => x.MaDichVu);
                });

            migrationBuilder.CreateTable(
                name: "NguoiDung",
                columns: table => new
                {
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenDangNhap = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    MatKhauHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HoTen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SoDienThoai = table.Column<string>(type: "varchar(15)", unicode: false, maxLength: 15, nullable: true),
                    NgaySinh = table.Column<DateOnly>(type: "date", nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    VaiTro = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TienDoLieuTrinh = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, defaultValue: "Chưa đăng ký"),
                    NgayTao = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__NguoiDun__C539D762D714BC45", x => x.MaNguoiDung);
                });

            migrationBuilder.CreateTable(
                name: "SanPham",
                columns: table => new
                {
                    MaSanPham = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenSanPham = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DonGia = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    SoLuong = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SanPham__FAC7442DE7BF3480", x => x.MaSanPham);
                });

            migrationBuilder.CreateTable(
                name: "NhatKyCongViec",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NgayThucHien = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    MaKhachHang = table.Column<int>(type: "int", nullable: true),
                    TenKhachHang = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MaDichVu = table.Column<int>(type: "int", nullable: true),
                    TenDichVu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LaLieuTrinh = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    GhiChu = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    HinhThucThanhToan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsConsultedByPA = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    TenNhanVienSale = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhatKyCongViec", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NhatKyCongViec_DichVu",
                        column: x => x.MaDichVu,
                        principalTable: "DichVu",
                        principalColumn: "MaDichVu");
                    table.ForeignKey(
                        name: "FK_NhatKyCongViec_KhachHang",
                        column: x => x.MaKhachHang,
                        principalTable: "NguoiDung",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "GiaoDich",
                columns: table => new
                {
                    MaGiaoDich = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NgayGiaoDich = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    MaKhachHang = table.Column<int>(type: "int", nullable: true),
                    TenKhachHang = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MaSanPham = table.Column<int>(type: "int", nullable: true),
                    MaDichVu = table.Column<int>(type: "int", nullable: true),
                    TenMatHang = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    LoaiHinh = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TenNhanVienSale = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MaNhanVienSale = table.Column<int>(type: "int", nullable: true),
                    TenNhanVienThucHien = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MaNhanVienThucHien = table.Column<int>(type: "int", nullable: true),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    ThucThu = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    SoTienNo = table.Column<decimal>(type: "decimal(19,2)", nullable: true, computedColumnSql: "([TongTien]-[ThucThu])", stored: false),
                    HinhThucThanhToan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsConsultedByPA = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GiaoDich__0A2A24EBE9429492", x => x.MaGiaoDich);
                    table.ForeignKey(
                        name: "FK__GiaoDich__MaDich__5AEE82B9",
                        column: x => x.MaDichVu,
                        principalTable: "DichVu",
                        principalColumn: "MaDichVu");
                    table.ForeignKey(
                        name: "FK__GiaoDich__MaKhac__59063A47",
                        column: x => x.MaKhachHang,
                        principalTable: "NguoiDung",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK__GiaoDich__MaNhan__5BE2A6F2",
                        column: x => x.MaNhanVienSale,
                        principalTable: "NguoiDung",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK__GiaoDich__MaNhan__5CD6CB2B",
                        column: x => x.MaNhanVienThucHien,
                        principalTable: "NguoiDung",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK__GiaoDich__MaSanP__59FA5E80",
                        column: x => x.MaSanPham,
                        principalTable: "SanPham",
                        principalColumn: "MaSanPham");
                });

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDich_MaDichVu",
                table: "GiaoDich",
                column: "MaDichVu");

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDich_MaKhachHang",
                table: "GiaoDich",
                column: "MaKhachHang");

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDich_MaNhanVienSale",
                table: "GiaoDich",
                column: "MaNhanVienSale");

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDich_MaNhanVienThucHien",
                table: "GiaoDich",
                column: "MaNhanVienThucHien");

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDich_MaSanPham",
                table: "GiaoDich",
                column: "MaSanPham");

            migrationBuilder.CreateIndex(
                name: "UQ__NguoiDun__0389B7BD290B2F90",
                table: "NguoiDung",
                column: "SoDienThoai",
                unique: true,
                filter: "[SoDienThoai] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UQ__NguoiDun__55F68FC02E9EE42F",
                table: "NguoiDung",
                column: "TenDangNhap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NhatKyCongViec_MaDichVu",
                table: "NhatKyCongViec",
                column: "MaDichVu");

            migrationBuilder.CreateIndex(
                name: "IX_NhatKyCongViec_MaKhachHang",
                table: "NhatKyCongViec",
                column: "MaKhachHang");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChiTieu");

            migrationBuilder.DropTable(
                name: "GiaoDich");

            migrationBuilder.DropTable(
                name: "NhatKyCongViec");

            migrationBuilder.DropTable(
                name: "SanPham");

            migrationBuilder.DropTable(
                name: "DichVu");

            migrationBuilder.DropTable(
                name: "NguoiDung");
        }
    }
}
