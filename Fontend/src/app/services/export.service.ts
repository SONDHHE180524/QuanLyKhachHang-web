import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Xuất file Excel với nhiều Sheet
   * @param sheets Mảng cấu hình các sheet
   * @param fileName Tên file
   */
  async exportMultiSheetExcel(sheets: { name: string, columns: any[], data: any[] }[], fileName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    for (const sheetConfig of sheets) {
      const worksheet = workbook.addWorksheet(sheetConfig.name);

      // 1. Cấu hình các cột
      worksheet.columns = sheetConfig.columns.map(col => ({
        header: col.header,
        key: col.key,
        width: col.width || 20,
        style: { font: { name: 'Arial', size: 11 } }
      }));

      // 2. Định dạng Header
      const headerRow = worksheet.getRow(1);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F46E5' }
        };
        cell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // 3. Thêm dữ liệu
      sheetConfig.data.forEach((item, index) => {
        const row = worksheet.addRow(item);
        row.height = 35;
        
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          });
        }

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
          
          // Áp dụng màu chữ nếu có yêu cầu
          if (item._rowStyle?.color) {
            cell.font = { ...cell.font, color: { argb: item._rowStyle.color } };
          }
          if (item._cellStyle?.customer?.color && worksheet.getColumn(colNumber).key === 'customer') {
            cell.font = { ...cell.font, color: { argb: item._cellStyle.customer.color } };
          }
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`);
  }

  /**
   * Xuất file Excel (Hỗ trợ gọi cũ)
   */
  async exportExcel(data: any[], columns: any[], fileName: string): Promise<void> {
    return this.exportMultiSheetExcel([{ name: 'Báo cáo', data, columns }], fileName);
  }

  /**
   * Xuất Dashboard ra PDF sắc nét
   */
  async exportPdf(elementId: string, fileName: string): Promise<void> {
    const data = document.getElementById(elementId);
    if (!data) return;

    window.scrollTo(0, 0);

    const canvas = await html2canvas(data, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      onclone: (clonedDoc) => {
        const btn = clonedDoc.querySelector('button.bg-rose-600');
        if (btn) (btn as HTMLElement).style.display = 'none';
        
        const inputs = clonedDoc.querySelectorAll('input[type="date"]');
        inputs.forEach(input => {
          (input as HTMLElement).style.border = 'none';
          (input as HTMLElement).style.background = 'transparent';
        });
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`${fileName}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`);
  }
}
