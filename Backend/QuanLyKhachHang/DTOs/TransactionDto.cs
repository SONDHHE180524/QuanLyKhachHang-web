using System.Text.Json.Serialization;
namespace QuanLyKhachHang.DTOs;

public class TransactionDto
{
    public int Id { get; set; }
    public DateTime? Date { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Debt { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("isConsultedByPA")]
    public bool? IsConsultedByPA { get; set; } = false;

    [JsonPropertyName("paymentMethod")]
    public string? PaymentMethod { get; set; }

    [JsonPropertyName("consultantName")]
    public string? ConsultantName { get; set; }
}

public class CreateTransactionRequest
{
    public int? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int? ProductId { get; set; }
    public int? ServiceId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    
    [JsonPropertyName("paymentMethod")]
    public string? PaymentMethod { get; set; }
    
    [JsonPropertyName("notes")]
    public string? Notes { get; set; }
    
    [JsonPropertyName("isConsultedByPA")]
    public bool? IsConsultedByPA { get; set; } = false;
    
    [JsonPropertyName("isTreatmentPackage")]
    public bool IsTreatmentPackage { get; set; } = false;

    [JsonPropertyName("consultantName")]
    public string? ConsultantName { get; set; }
}

public record ExpenseDto(
    int Id,
    DateOnly? Date,
    string Content,
    decimal Amount);

public record CreateExpenseRequest(
    string Content,
    decimal Amount);
