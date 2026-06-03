namespace QuanLyKhachHang.DTOs;

public record CustomerDto(
    int Id,
    string FullName,
    string? PhoneNumber,
    string? Address,
    string? TreatmentProgress,
    DateTime? CreatedAt);

public record ServiceDto(
    int Id,
    string Name,
    decimal PriceSingle,
    decimal PricePackage,
    bool IsTreatment,
    int DefaultSessions);

public record ProductDto(
    int Id,
    string Name,
    decimal Price,
    int Stock);
    
    
public record CreateCustomerRequest(
    string FullName,
    string? PhoneNumber,
    string? Address);

public record CustomerDebtDto(
    int? CustomerId,
    string CustomerName,
    string? PhoneNumber,
    decimal TotalDebt,
    DateTime? LastTransactionDate);

public record PayDebtRequest(
    int? CustomerId,
    string CustomerName,
    decimal Amount,
    string? PaymentMethod = null,
    string? Notes = null);

public record CreateServiceRequest(
    string Name,
    decimal PriceSingle,
    decimal PricePackage,
    bool IsTreatment,
    int DefaultSessions);

public record CreateProductRequest(
    string Name,
    decimal Price,
    int Stock);

public record RefundCalculationDto(
    string CustomerName,
    string ServiceName,
    int SessionsDone,
    int TotalSessions,
    decimal SinglePrice,
    decimal PackagePrice,
    decimal PaidAmount,
    decimal UsedCost,
    decimal RefundAmount);

public record ProcessRefundRequest(
    decimal RefundAmount,
    string? Notes);
