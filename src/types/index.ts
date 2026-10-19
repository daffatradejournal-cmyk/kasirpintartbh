export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  buyPrice: number; // Harga Modal
  sellPrice: number; // Harga Jual
  stock: number;
  minStock: number;
  unit: string;
  emoji?: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface TransactionItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  totalAmount: number; // Subtotal kotor
  discountAmount: number; // Diskon nota
  finalAmount: number; // Total bayar
  paidAmount: number; // Uang diterima
  changeAmount: number; // Kembalian
  paymentMethod: 'CASH' | 'QRIS';
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  isVoid: boolean;
  items: TransactionItem[];
}

export interface StoreProfile {
  storeName: string;
  address: string;
  phone: string;
  receiptFooter: string;
  activeCashier: string;
}
