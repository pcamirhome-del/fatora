import { Invoice } from '../types';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';

// Declare html2pdf for TypeScript
declare var html2pdf: any;

export const exportToWord = async (invoice: Invoice) => {
  const logoHtml = invoice.companyLogo ? `<img src="${invoice.companyLogo}" style="width: 80px; height: 80px; position: absolute; left: 20px; top: 20px;" />` : '';
  const watermarkHtml = invoice.watermarkText ? `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80pt; color: #f0f0f0; z-index: -1; opacity: 0.5; white-space: nowrap;">${invoice.watermarkText}</div>` : '';
  
  // Generate QR Code for Word Export
  const qrUrl = invoice.websiteUrl || window.location.href;
  let qrHtml = '';
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, { width: 100, margin: 1 });
    qrHtml = `
      <div style="position: absolute; bottom: 20px; right: 20px; text-align: center;">
        <img src="${qrCodeDataUrl}" style="width: 80px; height: 80px;" />
      </div>
    `;
  } catch (e) {
    console.error("Error generating QR for Word", e);
  }

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' dir="rtl">
    <head><meta charset='utf-8'><title>${invoice.pageTitle} ${invoice.invoiceNumber}</title></head>
    <body style="font-family: Arial, sans-serif; text-align: right; position: relative; padding-bottom: 120px;">
      ${watermarkHtml}
      ${logoHtml}
      <h1 style="text-align: center; font-size: 24pt; font-weight: bold; color: #1e1b4b;">${invoice.companyName}</h1>
      <p style="text-align: center; font-size: 14pt; font-weight: bold; color: #6b7280;">${invoice.pageTitle}</p>
      <hr>
      <div style="margin-bottom: 20px;">
        <p><strong>رقم الفاتورة:</strong> &nbsp; ${invoice.invoiceNumber}</p>
        <p><strong>تاريخ الطلب:</strong> &nbsp; ${invoice.orderDate}</p>
        <p><strong>اسم العميل:</strong> ${invoice.customerName}</p>
        <p><strong>رقم الهاتف:</strong> ${invoice.phone1} ${invoice.phone2 ? '/ ' + invoice.phone2 : ''}</p>
        <p><strong>العنوان:</strong> ${invoice.address} ${invoice.governorate ? '- ' + invoice.governorate : ''}</p>
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
      ${qrHtml}
      
      <p style="text-align: center; font-family: Arial, sans-serif; font-size: 10pt; color: #808080; margin-top: 20px;">شكرا لتعاملكم معنا</p>
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

export const exportToExcel = async (invoice: Invoice) => {
  // 1. Generate QR Code Data URL
  let qrCodeDataUrl = '';
  try {
    const qrUrl = invoice.websiteUrl || window.location.href;
    qrCodeDataUrl = await QRCode.toDataURL(qrUrl, { width: 100, margin: 0 });
  } catch (e) {
    console.error("Error generating QR", e);
  }

  // 2. Styles (Matching PDF/Tailwind colors)
  const styles = `
    <style>
      body { font-family: 'Arial', sans-serif; direction: rtl; }
      .container { width: 100%; max-width: 800px; margin: 0 auto; }
      .header-title { font-size: 24pt; font-weight: bold; color: #312e81; }
      .sub-title { font-size: 14pt; font-weight: bold; color: #6b7280; } /* Gray color updated */
      .meta-label { font-size: 10pt; color: #6b7280; font-weight: bold; }
      .meta-value { font-size: 11pt; color: #312e81; font-weight: bold; }
      .customer-box { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 10px; }
      .table-header { background-color: #312e81; color: white; font-weight: bold; text-align: center; border: 1px solid #000; }
      .table-cell { border: 1px solid #e5e7eb; padding: 8px; text-align: center; font-size: 12pt; }
      .total-box { background-color: #eef2ff; color: #111827; font-weight: bold; font-size: 16pt; border: 1px solid #4f46e5; }
      .shipping-text { color: #4b5563; font-weight: bold; }
      .footer-sign { border-top: 1px solid #9ca3af; width: 200px; margin-top: 40px; text-align: center; color: #9ca3af; font-size: 10pt; }
      .footer-msg { text-align: center; font-family: Arial, sans-serif; font-size: 10pt; color: #808080; font-weight: bold; }
    </style>
  `;

  // 3. Construct HTML Content for Excel
  const excelContent = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        ${styles}
      </head>
      <body>
        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
          <!-- Header Section -->
          <tr>
            <td colspan="2" style="text-align: right; vertical-align: top; padding: 20px;">
              <div class="header-title">${invoice.companyName}</div>
              <div class="sub-title">${invoice.pageTitle}</div>
            </td>
            <td colspan="2" style="text-align: left; vertical-align: top; padding: 20px;">
              ${invoice.companyLogo ? `<img src="${invoice.companyLogo}" width="100" height="100" />` : ''}
            </td>
          </tr>
          
          <!-- Invoice Meta -->
          <tr>
            <td colspan="4" style="padding: 10px; border-bottom: 2px solid #4f46e5;">
              <span class="meta-label">رقم الفاتورة: &nbsp;</span><span class="meta-value">${invoice.invoiceNumber}</span>
              <br/>
              <span class="meta-label">التاريخ: &nbsp;</span><span class="meta-value">${invoice.orderDate}</span>
            </td>
          </tr>

          <tr><td colspan="4" height="20"></td></tr>

          <!-- Customer Info Box -->
          <tr style="background-color: #f9fafb;">
            <td colspan="2" style="padding: 15px; border: 1px solid #e5e7eb;">
               <div class="meta-label">بيانات العميل</div>
               <div style="font-size: 14pt; font-weight: bold; color: #111827;">${invoice.customerName}</div>
               <div style="color: #6b7280;">${invoice.address} ${invoice.governorate ? '- ' + invoice.governorate : ''}</div>
            </td>
            <td colspan="2" style="padding: 15px; border: 1px solid #e5e7eb; text-align: left;">
               <div class="meta-label">أرقام التواصل</div>
               <div style="font-size: 12pt; font-weight: bold;">${invoice.phone1}</div>
               <div style="font-size: 12pt; font-weight: bold;">${invoice.phone2}</div>
            </td>
          </tr>

          <tr><td colspan="4" height="20"></td></tr>

          <!-- Items Table -->
          <tr style="background-color: #312e81; color: white;">
            <th class="table-header" style="width: 40%;">الصنف</th>
            <th class="table-header" style="width: 20%;">الكمية</th>
            <th class="table-header" style="width: 20%;">السعر</th>
            <th class="table-header" style="width: 20%;">الإجمالي</th>
          </tr>
          <tr>
            <td class="table-cell" style="text-align: right; font-weight: bold;">${invoice.productName}</td>
            <td class="table-cell">${invoice.quantity}</td>
            <td class="table-cell">${invoice.price} ج.م</td>
            <td class="table-cell" style="text-align: left; font-weight: bold;">${invoice.price * invoice.quantity} ج.م</td>
          </tr>
          
          <tr><td colspan="4" height="20"></td></tr>

          <!-- Totals -->
          <tr>
            <td colspan="2"></td>
            <td class="shipping-text" style="text-align: left; padding: 5px;">مصاريف الشحن:</td>
            <td style="text-align: left; padding: 5px; font-weight: bold;">${invoice.shippingCost} ج.م</td>
          </tr>
          <tr>
            <td colspan="2"></td>
            <td colspan="2" class="total-box" style="text-align: center; padding: 10px; background-color: #eef2ff; border: 1px solid #4f46e5;">
               الإجمالي: ${invoice.total} ج.م
            </td>
          </tr>

          <tr><td colspan="4" height="40"></td></tr>

          <!-- Footer: Signature & QR -->
          <tr>
            <td colspan="2" style="vertical-align: bottom; text-align: center;">
               <div style="border-top: 1px solid #ccc; width: 60%; margin: 0 auto; padding-top: 5px; color: #999;">توقيع المستلم</div>
            </td>
            <td colspan="2" style="text-align: left; padding-right: 20px;">
               ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" width="80" height="80" />` : ''}
            </td>
          </tr>
          
          <tr><td colspan="4" height="20"></td></tr>

          <!-- Footer Message -->
          <tr>
            <td colspan="4" class="footer-msg">
               شكرا لتعاملكم معنا
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // 4. Download as XLS file
  const blob = new Blob(['\ufeff', excelContent], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice_${invoice.invoiceNumber}.xls`; // .xls handles HTML content best
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (elementId: string, invoiceNumber: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin: 0, // Zero margin to capture full styles
    filename: `Invoice_${invoiceNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};