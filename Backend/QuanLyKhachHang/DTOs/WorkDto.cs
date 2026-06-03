using System;

using System.Text.Json.Serialization;
namespace QuanLyKhachHang.DTOs;

public record WorkLogDto(
    int Id,
    DateTime? Date,
    int? CustomerId,
    string? CustomerName,
    int? ServiceId,
    string? ServiceName,
    bool? IsTreatment,
    decimal Revenue,
    [property: JsonPropertyName("notes")] string? Notes,
    [property: JsonPropertyName("isConsultedByPA")] bool? IsConsultedByPA = false,
    [property: JsonPropertyName("paymentMethod")] string? PaymentMethod = null,
    [property: JsonPropertyName("customerDebt")] decimal? CustomerDebt = 0,
    [property: JsonPropertyName("dailyTotalRevenue")] decimal? DailyTotalRevenue = 0,
    [property: JsonPropertyName("consultantName")] string? ConsultantName = null
);

public record CheckInRequest(
    int? CustomerId,
    string CustomerName,
    int? ServiceId,
    string? ServiceName,
    bool IsTreatment,
    [property: JsonPropertyName("isFreeSession")] bool? IsFreeSession,
    [property: JsonPropertyName("notes")] string? Notes,
    [property: JsonPropertyName("paymentMethod")] string? PaymentMethod,
    [property: JsonPropertyName("date")] DateTime? Date,
    [property: JsonPropertyName("isConsultedByPA")] bool? IsConsultedByPA = false,
    [property: JsonPropertyName("consultantName")] string? ConsultantName = null
);
