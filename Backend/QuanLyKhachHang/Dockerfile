# Bước 1: Dùng SDK .NET 8 để build code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy file project vào và khôi phục các thư viện NuGet
COPY *.csproj ./
RUN dotnet restore

# Copy toàn bộ code còn lại vào và publish ra thư mục out
COPY . ./
RUN dotnet publish -c Release -o out

# Bước 2: Dùng Runtime nhẹ để chạy ứng dụng (tiết kiệm RAM cho gói Free của Render)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

# Cấu hình cổng chạy cho Render
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Chạy ứng dụng khi container khởi động (Đã khớp chuẩn tên dự án của bạn)
ENTRYPOINT ["dotnet", "QuanLyKhachHang.dll"]
