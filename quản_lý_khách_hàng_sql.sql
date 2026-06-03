-- 1. Tạo Database
CREATE DATABASE QuanLyCuaHangDB;
GO
USE QuanLyCuaHangDB;
GO

-- 2. Bảng Người Dùng (Gộp Admin, NV, Khách)
CREATE TABLE NguoiDung (
    MaNguoiDung INT PRIMARY KEY IDENTITY(1,1),
    TenDangNhap VARCHAR(100) NOT NULL UNIQUE, 
    MatKhauHash NVARCHAR(MAX) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(15) UNIQUE,
    NgaySinh DATE,
    DiaChi NVARCHAR(255),
    VaiTro NVARCHAR(50) NOT NULL, -- 'Admin', 'NhanVien', 'KhachHang'
    TienDoLieuTrinh NVARCHAR(100) DEFAULT N'Chưa đăng ký',
    NgayTao DATETIME DEFAULT GETDATE()
);

-- 3. Bảng Sản Phẩm
CREATE TABLE SanPham (
    MaSanPham INT PRIMARY KEY IDENTITY(1,1),
    TenSanPham NVARCHAR(100) NOT NULL,
    DonGia DECIMAL(18, 2) DEFAULT 0
);

-- 4. Bảng Dịch Vụ
CREATE TABLE DichVu (
    MaDichVu INT PRIMARY KEY IDENTITY(1,1),
    TenDichVu NVARCHAR(100) NOT NULL,
    GiaBuoiLe DECIMAL(18, 2) DEFAULT 0,
    GiaTronGoi DECIMAL(18, 2) DEFAULT 0,
    LieuTrinh BIT DEFAULT 0, 
    SoBuoiMacDinh INT DEFAULT 1,
    GhiChuDichVu NVARCHAR(MAX)
);

-- 5. Bảng Giao Dịch (Lưu toàn bộ lịch sử)
CREATE TABLE GiaoDich (
    MaGiaoDich INT PRIMARY KEY IDENTITY(1,1),
    NgayGiaoDich DATETIME DEFAULT GETDATE(),
    MaKhachHang INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    TenKhachHang NVARCHAR(100),
    MaSanPham INT NULL FOREIGN KEY REFERENCES SanPham(MaSanPham),
    MaDichVu INT NULL FOREIGN KEY REFERENCES DichVu(MaDichVu),
    TenMatHang NVARCHAR(255),
    
    -- Các loại: 'Mua gói', 'Liệu trình' (đi làm), 'Buổi lẻ', 'Sản phẩm', 'Trả nợ'
    LoaiHinh NVARCHAR(50), 
    
    TenNhanVienSale NVARCHAR(100),
    MaNhanVienSale INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    TenNhanVienThucHien NVARCHAR(100),
    MaNhanVienThucHien INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    
    TongTien DECIMAL(18, 2) DEFAULT 0,
    ThucThu DECIMAL(18, 2) DEFAULT 0,
    SoTienNo AS (TongTien - ThucThu),
    HinhThucThanhToan NVARCHAR(50), -- 'Chuyển khoản', 'Tiền mặt'
    GhiChu NVARCHAR(MAX)
);

-- 6. Bảng Chi Tiêu
CREATE TABLE ChiTieu (
    MaChiTieu INT PRIMARY KEY IDENTITY(1,1),
    NgayChi DATE DEFAULT GETDATE(),
    NoiDungChi NVARCHAR(255) NOT NULL,
    SoTien DECIMAL(18, 2) NOT NULL
);
GO

-- 7. TRIGGER: Tự động đếm số buổi từ lịch sử giao dịch để cập nhật tiến độ
CREATE TRIGGER trg_CapNhatTienDoTuDong
ON GiaoDich
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Lấy thông tin khách hàng và dịch vụ từ dòng vừa chèn
    DECLARE @MaKH INT, @MaDV INT, @Loai NVARCHAR(50);
    SELECT @MaKH = MaKhachHang, @MaDV = MaDichVu, @Loai = LoaiHinh FROM inserted;

    -- Nếu là đi làm theo liệu trình
    IF (@Loai = N'Liệu trình' AND @MaDV IS NOT NULL)
    BEGIN
        DECLARE @SoBuoiDaLam INT, @TongBuoi INT, @TenDV NVARCHAR(100);

        -- Đếm số lần khách đã đi làm dịch vụ này trong bảng GiaoDich
        SELECT @SoBuoiDaLam = COUNT(*) 
        FROM GiaoDich 
        WHERE MaKhachHang = @MaKH AND MaDichVu = @MaDV AND LoaiHinh = N'Liệu trình';

        -- Lấy tổng số buổi định mức từ bảng dịch vụ
        SELECT @TongBuoi = SoBuoiMacDinh, @TenDV = TenDichVu 
        FROM DichVu WHERE MaDichVu = @MaDV;

        -- Cập nhật vào bảng NguoiDung
        UPDATE NguoiDung
        SET TienDoLieuTrinh = @TenDV + ': ' + CAST(@SoBuoiDaLam AS NVARCHAR) + '/' + CAST(@TongBuoi AS NVARCHAR)
        WHERE MaNguoiDung = @MaKH;
    END
END;
GO

INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, HoTen, SoDienThoai, NgaySinh, DiaChi, VaiTro)
VALUES 
('panh05122004@gmail.com', '123456', N'Phương Anh', '0912345678', '2000-01-01', N'Hà Nội', 'Admin'),
('a', '123456', N'a', '0987654321', '2002-05-15', N'Hải Phòng', 'NhanVien'),
('b', '123456', N'b', '0901122334', '2001-10-20', N'Đà Nẵng', 'NhanVien'),
('khach_lan', 'hash_pw_4', N'Nguyễn Thị Lan', '0944556677', '1995-03-12', N'Hà Nội', 'KhachHang'),
('khach_minh', 'hash_pw_5', N'Trần Quang Minh', '0933221100', '1990-12-25', N'TP.HCM', 'KhachHang');

INSERT INTO SanPham (TenSanPham, DonGia)
VALUES 
(N'Khoáng', 3000000),
(N'Đai cổ', 494000),
(N'Đai lưng', 2080000),
(N'Đai gối', 1040000);

INSERT INTO DichVu (TenDichVu, GiaBuoiLe, GiaTronGoi, LieuTrinh, SoBuoiMacDinh, GhiChuDichVu)
VALUES 
(N'Chăm sóc vùng cổ,vai,gáy', 300000, 2500000, 1, 10,null),
(N'Chăm sóc vùng lưng,chân',  300000, 2500000, 1, 10,null),
(N'Chăm sóc toàn thân', 450000, 4000000, 1, 10, null),
(N'Siết eo và giảm mỡ bụng', 600000, 5000000, 1, 10, null),
(N'Điều hòa khí huyết và thải độc', 50000, 1000000, 1, 10,null),
(N'Chăm sóc vùng đầu thải độc não bộ', 300000, 2500000, 1, 10,null);
