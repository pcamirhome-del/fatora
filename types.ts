
export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
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
}

export type InvoiceFormData = Omit<Invoice, 'id' | 'total'>;
