import { Invoice } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { APP_LOGO } from '../constants';

// Utility to convert image URL to Base64 for PDF
const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

export const exportToWord = async (invoice: Invoice) => {
  // Use HTML structure for Word export
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' dir="rtl">
    <head>
      <meta charset='utf-8'>
      <title>فاتورة ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: 'Arial', sans-serif; text-align: right; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 150px; }
        .info-box { margin-bottom: 20px; border: 1px solid #eee; padding: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
        th { background-color: #f8f9fa; }
        .total-box { margin-top: 20px; text-align: left; }
        .footer { margin-top: 50px; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${APP_LOGO}" class="logo" />
        <h1 style="color: #4f46e5;">Mr & Mrs Fashion</h1>
        <h2 style="background-color: #4f46e5; color: white; padding: 5px;">فاتورة بيع</h2>
      </div>

      <div class="info-box">
        <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>التاريخ:</strong> ${invoice.orderDate}</p>
        <hr/>
        <p><strong>العميل:</strong> ${invoice.customerName}</p>
        <p><strong>الهاتف:</strong> ${invoice.phone1} / ${invoice.phone2}</p>
        <p><strong>العنوان:</strong> ${invoice.address}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>اسم الصنف</th>
            <th>العدد</th>
            <th>السعر</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.productName}</td>
            <td>${invoice.quantity}</td>
            <td>${invoice.price} ج.م</td>
          </tr>
        </tbody>
      </table>

      <div class="total-box">
        <p>مصاريف التوصيل: ${invoice.shippingCost} ج.م</p>
        <h3 style="color: #4f46e5;">الإجمالي الكلي: ${invoice.total} ج.م</h3>
      </div>

      <div class="footer">
        <p>إمضاء الاستلام: ..............................</p>
      </div>
      <p style="text-align: center; font-size: 8pt; color: #999; margin-top: 40px;">شكراً لتعاملكم معنا</p>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `فاتورة_${invoice.invoiceNumber}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (invoice: Invoice) => {
  // Creating a structured Excel sheet as requested
  const worksheetData = [
    ['', '', 'فاتورة'],
    ['', '', 'Mr & Mrs Fashion'],
    [''],
    ['رقم الفاتورة:', invoice.invoiceNumber, '', 'التاريخ:', invoice.orderDate],
    [''],
    ['بيانات العميل:'],
    ['الاسم:', invoice.customerName, '', 'رقم الهاتف:', invoice.phone1],
    ['العنوان:', invoice.address, '', 'رقم آخر:', invoice.phone2],
    [''],
    ['اسم الصنف', 'العدد', 'السعر'],
    [invoice.productName, invoice.quantity, invoice.price],
    [''],
    ['', 'مصاريف التوصيل:', invoice.shippingCost],
    ['', 'الإجمالي:', invoice.total],
    [''],
    ['', '', 'إمضاء الاستلام'],
    ['', '', '........................']
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
  XLSX.writeFile(wb, `فاتورة_${invoice.invoiceNumber}.xlsx`);
};

export const exportToPDF = async (invoice: Invoice) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  try {
    const logoBase64 = await getBase64ImageFromURL(APP_LOGO);
    doc.addImage(logoBase64, 'PNG', 85, 10, 40, 40);
  } catch (e) {
    console.warn("Logo could not be loaded for PDF export", e);
  }

  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text('Mr & Mrs Fashion', 105, 55, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Invoice / فاتورة بيع', 105, 65, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 70, 190, 70);

  doc.setFontSize(12);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 20, 80);
  doc.text(`Date: ${invoice.orderDate}`, 20, 87);
  
  doc.text(`Customer: ${invoice.customerName}`, 110, 80);
  doc.text(`Phone: ${invoice.phone1} / ${invoice.phone2}`, 110, 87);
  doc.text(`Address: ${invoice.address}`, 110, 94);

  autoTable(doc, {
    startY: 105,
    head: [['Product / الصنف', 'Qty / العدد', 'Price / السعر']],
    body: [[invoice.productName, invoice.quantity, `${invoice.price} EGP`]],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { halign: 'center', fontSize: 10 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text(`Shipping / التوصيل: ${invoice.shippingCost} EGP`, 130, finalY);
  
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text(`Total / الإجمالي: ${invoice.total} EGP`, 130, finalY + 10);
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.text('Signature / التوقيع: ____________________', 20, finalY + 25);

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};