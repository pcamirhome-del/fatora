
export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
  companyLogo?: string; // Base64 image
  customerName: string;
  phone1: string;
  phone2: string;
  address: string;
  orderDate: string;
  productName: string;
  quantity: number;
  price: number;
  shippingCost: number;
  total: number;
  watermarkText?: string;
}

export type InvoiceFormData = Omit<Invoice, 'id' | 'total'>;
