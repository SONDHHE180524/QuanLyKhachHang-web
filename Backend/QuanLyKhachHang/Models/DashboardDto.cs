using System;
using System.Collections.Generic;

namespace QuanLyKhachHang.Models;

public class DashboardDto
{
    public decimal TotalRevenue { get; set; }
    public decimal ServiceRevenue { get; set; }
    public decimal ProductRevenue { get; set; }
    public decimal RefundAmount { get; set; }
    public decimal MonthlyExpense { get; set; }
    public decimal Profit { get; set; }
    public decimal Debt { get; set; }
    public List<DailyRevenueDto> BarChartData { get; set; } = new();
    public List<ServiceDistributionDto> ServiceDistribution { get; set; } = new();
    public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
    public List<CustomerProgressDto> CustomerProgress { get; set; } = new();
    public List<CustomerServedDto> CustomersServed { get; set; } = new();
}

public class CustomerServedDto
{
    public int? CustomerId { get; set; }
    public string CustomerName { get; set; } = null!;
    public string ServiceName { get; set; } = null!;
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public string Type { get; set; } = null!;
}

public class CustomerProgressDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Service { get; set; } = null!;
    public int CurrentSession { get; set; }
    public int TotalSessions { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class DailyRevenueDto
{
    public string Day { get; set; } = null!;
    public decimal Revenue { get; set; }
}

public class ServiceDistributionDto
{
    public string Label { get; set; } = null!;
    public int Count { get; set; }
    public double Percentage { get; set; }
    public string Color { get; set; } = null!;
}

public class RecentTransactionDto
{
    public int Id { get; set; }
    public DateTime? Date { get; set; }
    public string CustomerName { get; set; } = null!;
    public string ItemName { get; set; } = null!;
    public string Type { get; set; } = null!;
    public decimal Amount { get; set; }
    public decimal Paid { get; set; }
    public decimal Debt { get; set; }
    public string Status { get; set; } = null!;
}
