using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhachHang.Core;
using QuanLyKhachHang.DTOs;
using QuanLyKhachHang.Models;
using QuanLyKhachHang.Services;

namespace QuanLyKhachHang.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController(ITransactionService transactionService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetTransactions([FromQuery] int count = 50)
    {
        var result = await transactionService.GetTransactionsAsync(count);
        return Ok(ApiResponse<IEnumerable<TransactionDto>>.SuccessResult(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionRequest request)
    {
        var result = await transactionService.CreateTransactionAsync(request);
        return Ok(ApiResponse<TransactionDto>.SuccessResult(result, "Tạo giao dịch thành công."));
    }

    [HttpGet("expenses")]
    public async Task<IActionResult> GetExpenses()
    {
        var result = await transactionService.GetExpensesAsync();
        return Ok(ApiResponse<IEnumerable<ExpenseDto>>.SuccessResult(result));
    }

    [HttpPost("expenses")]
    public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseRequest request)
    {
        var result = await transactionService.CreateExpenseAsync(request);
        return Ok(ApiResponse<ExpenseDto>.SuccessResult(result, "Ghi nhận chi phí thành công."));
    }
}
