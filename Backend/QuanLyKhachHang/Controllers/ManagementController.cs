using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyKhachHang.Core;
using QuanLyKhachHang.DTOs;
using QuanLyKhachHang.Services;

namespace QuanLyKhachHang.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManagementController(IManagementService managementService) : ControllerBase
{
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        var result = await managementService.GetCustomersAsync();
        return Ok(ApiResponse<IEnumerable<CustomerDto>>.SuccessResult(result));
    }

    [HttpPost("customers")]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var result = await managementService.CreateCustomerAsync(request);
        return Ok(ApiResponse<CustomerDto>.SuccessResult(result, "Thêm khách hàng thành công."));
    }

    [HttpPut("customers/{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CreateCustomerRequest request)
    {
        var result = await managementService.UpdateCustomerAsync(id, request);
        if (result == null) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy khách hàng."));
        return Ok(ApiResponse<CustomerDto>.SuccessResult(result, "Cập nhật khách hàng thành công."));
    }

    [HttpDelete("customers/{id}")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var success = await managementService.DeleteCustomerAsync(id);
        if (!success) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy khách hàng."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Xóa khách hàng thành công."));
    }

    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var result = await managementService.GetServicesAsync();
        return Ok(ApiResponse<IEnumerable<ServiceDto>>.SuccessResult(result));
    }

    [HttpPost("services")]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceRequest request)
    {
        var result = await managementService.CreateServiceAsync(request);
        return Ok(ApiResponse<ServiceDto>.SuccessResult(result, "Thêm dịch vụ thành công."));
    }

    [HttpPut("services/{id}")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] CreateServiceRequest request)
    {
        var result = await managementService.UpdateServiceAsync(id, request);
        if (result == null) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy dịch vụ."));
        return Ok(ApiResponse<ServiceDto>.SuccessResult(result, "Cập nhật dịch vụ thành công."));
    }

    [HttpDelete("services/{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var success = await managementService.DeleteServiceAsync(id);
        if (!success) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy dịch vụ."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Xóa dịch vụ thành công."));
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        var result = await managementService.GetProductsAsync();
        return Ok(ApiResponse<IEnumerable<ProductDto>>.SuccessResult(result));
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var result = await managementService.CreateProductAsync(request);
        return Ok(ApiResponse<ProductDto>.SuccessResult(result, "Thêm sản phẩm thành công."));
    }

    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductRequest request)
    {
        var result = await managementService.UpdateProductAsync(id, request);
        if (result == null) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy sản phẩm."));
        return Ok(ApiResponse<ProductDto>.SuccessResult(result, "Cập nhật sản phẩm thành công."));
    }

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var success = await managementService.DeleteProductAsync(id);
        if (!success) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy sản phẩm."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Xóa sản phẩm thành công."));
    }

    [HttpGet("debt-list")]
    public async Task<IActionResult> GetDebtList()
    {
        var result = await managementService.GetDebtListAsync();
        return Ok(ApiResponse<IEnumerable<CustomerDebtDto>>.SuccessResult(result));
    }

    [HttpGet("customer-unpaid-transactions")]
    public async Task<IActionResult> GetCustomerUnpaidTransactions([FromQuery] int? customerId, [FromQuery] string customerName)
    {
        var result = await managementService.GetCustomerUnpaidTransactionsAsync(customerId, customerName);
        return Ok(ApiResponse<IEnumerable<TransactionDto>>.SuccessResult(result));
    }

    [HttpPost("pay-debt")]
    public async Task<IActionResult> PayDebt([FromBody] PayDebtRequest request)
    {
        var success = await managementService.PayDebtAsync(request);
        if (!success) return BadRequest(ApiResponse<object>.FailureResult("Không có nợ cần thanh toán hoặc có lỗi xảy ra."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Thanh toán nợ thành công."));
    }

    [HttpPost("customers/{id}/finish-treatment")]
    public async Task<IActionResult> FinishTreatment(int id)
    {
        var success = await managementService.FinishTreatmentAsync(id);
        if (!success) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy khách hàng."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Kết thúc liệu trình thành công."));
    }

    [HttpGet("customers/{id}/calculate-refund")]
    public async Task<IActionResult> CalculateRefund(int id)
    {
        var result = await managementService.CalculateRefundAsync(id);
        if (result == null) return NotFound(ApiResponse<object>.FailureResult("Không thể tính toán hoàn tiền cho khách hàng này."));
        return Ok(ApiResponse<RefundCalculationDto>.SuccessResult(result));
    }

    [HttpPost("customers/{id}/process-refund")]
    public async Task<IActionResult> ProcessRefund(int id, [FromBody] ProcessRefundRequest request)
    {
        var success = await managementService.ProcessRefundAsync(id, request);
        if (!success) return BadRequest(ApiResponse<object>.FailureResult("Có lỗi xảy ra khi xử lý hoàn tiền."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Xử lý hoàn tiền thành công."));
    }

    [HttpGet("refund-list")]
    public async Task<IActionResult> GetRefundList()
    {
        var result = await managementService.GetRefundListAsync();
        return Ok(ApiResponse<IEnumerable<TransactionDto>>.SuccessResult(result));
    }
}
