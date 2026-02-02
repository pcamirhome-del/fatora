import { Invoice } from '../types';
import * as XLSX from 'xlsx';

// Declare html2pdf for TypeScript
declare var html2pdf: any;

export const exportToWord = (invoice: Invoice) => {
  const logoHtml = invoice.companyLogo ? `<img src="${invoice.companyLogo}" style="width: 80px; height: 80px; position: absolute; left: 20px; top: 20px;" />` : '';
  const watermarkHtml = invoice.watermarkText ? `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80pt; color: #f0f0f0; z-index: -1; opacity: 0.5; white-space: nowrap;">${invoice.watermarkText}</div>` : '';

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' dir="rtl">
    <head><meta charset='utf-8'><title>فاتورة ${invoice.invoiceNumber}</title></head>
    <body style="font-family: Arial, sans-serif; text-align: right; position: relative;">
      ${watermarkHtml}
      ${logoHtml}
      <h1 style="text-align: center; font-size: 24pt; font-weight: bold; color: #1e1b4b;">${invoice.companyName}</h1>
      <p style="text-align: center; font-size: 10pt; color: #666;">فاتورة مبيعات معتمدة</p>
      <hr>
      <div style="margin-bottom: 20px;">
        <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>تاريخ الطلب:</strong> ${invoice.orderDate}</p>
        <p><strong>اسم العميل:</strong> ${invoice.customerName}</p>
        <p><strong>رقم الهاتف:</strong> ${invoice.phone1} ${invoice.phone2 ? '/ ' + invoice.phone2 : ''}</p>
        <p><strong>العنوان:</strong> ${invoice.address}</p>
      </div>
      <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>الصنف</th>
            <th>العدد</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.productName}</td>
            <td>${invoice.quantity}</td>
            <td>${invoice.price} ج.م</td>
            <td>${invoice.price * invoice.quantity} ج.م</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 20px; text-align: left;">
        <p><strong>مصاريف التوصيل:</strong> ${invoice.shippingCost} ج.م</p>
        <p style="font-size: 16pt; font-weight: bold; color: #1e1b4b;"><strong>الإجمالي النهائي:</strong> ${invoice.total} ج.م</p>
      </div>
      <div style="margin-top: 60px;">
        <p>توقيع المستلم: ........................................</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice_${invoice.invoiceNumber}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (invoice: Invoice) => {
  const worksheetData = [
    ['فاتورة مبيعات', '', '', invoice.companyName],
    ['رقم الفاتورة:', invoice.invoiceNumber, '', 'التاريخ:', invoice.orderDate],
    ['اسم العميل:', invoice.customerName],
    ['الهاتف:', invoice.phone1],
    ['العنوان:', invoice.address],
    [''],
    ['اسم الصنف', 'العدد', 'السعر الإفرادي', 'الإجمالي'],
    [invoice.productName, invoice.quantity, invoice.price, invoice.price * invoice.quantity],
    [''],
    ['', '', 'مصاريف التوصيل:', invoice.shippingCost],
    ['', '', 'الإجمالي النهائي:', invoice.total],
    [''],
    ['تم الاستلام بواسطة:', '....................', 'توقيع الشركة:', '....................']
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'فاتورة');
  XLSX.writeFile(wb, `Invoice_${invoice.invoiceNumber}.xlsx`);
};

export const exportToPDF = (elementId: string, invoiceNumber: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin: 10,
    filename: `Invoice_${invoiceNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Use html2pdf to handle Arabic correctly via canvas rendering
  html2pdf().set(opt).from(element).save();
};
