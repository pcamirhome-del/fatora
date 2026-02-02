
export interface Invoice {
  id: string;
  invoiceNumber: string;
  pageTitle: string;
  companyName: string;
  companyLogo?: string;
  customerName: string;
  phone1: string;
  phone2: string;
  address: string;
  governorate?: string; // New: Selected Governorate
  orderDate: string;
  productName: string;
  quantity: number;
  price: number;
  purchasePrice?: number; // New: For calculating profit
  shippingCost: number;
  total: number;
  watermarkText?: string;
  websiteUrl?: string;
}

export type InvoiceFormData = Omit<Invoice, 'id' | 'total'>;

export const EGYPT_GOVERNORATES = [
  "القاهرة", "الإسكندرية", "البحيرة", "مطروح", "الدقهلية", "الشرقية", "الغربية", 
  "المنوفية", "دمياط", "كفر الشيخ", "بورسعيد", "الإسماعيلية", "السويس", "الفيوم", 
  "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر", 
  "الوادي الجديد", "شمال سيناء", "جنوب سيناء"
];
