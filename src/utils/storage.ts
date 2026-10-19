import { Product, StoreProfile, Transaction } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'kasirpintar_products',
  TRANSACTIONS: 'kasirpintar_transactions',
  STORE_PROFILE: 'kasirpintar_profile',
};

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  storeName: 'Kasir Pintar - Toko Berkah Mandiri',
  address: 'Jl. M. Boya No. 45, Tembilahan, Kab. Indragiri Hilir',
  phone: '0812-7654-3210',
  receiptFooter: 'Terima Kasih Telah Berbelanja!\nBarang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.',
  activeCashier: 'Daffa (Kasir Utama)',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: '8999999000101',
    name: 'Beras Ramos Super 5kg',
    category: 'Sembako & Beras',
    buyPrice: 65000,
    sellPrice: 72000,
    stock: 25,
    minStock: 5,
    unit: 'Sak',
    emoji: '🍚',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    code: '8999999000102',
    name: 'Minyak Goreng Kita 2 Liter',
    category: 'Sembako & Beras',
    buyPrice: 28500,
    sellPrice: 32000,
    stock: 18,
    minStock: 6,
    unit: 'Pouch',
    emoji: '🛢️',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    code: '8999999000103',
    name: 'Gula Pasir Gulaku 1kg',
    category: 'Sembako & Beras',
    buyPrice: 15000,
    sellPrice: 17500,
    stock: 30,
    minStock: 10,
    unit: 'Bungkus',
    emoji: '🧂',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    code: '8999999000104',
    name: 'Telur Ayam Ras 1 Papan (30 Butir)',
    category: 'Sembako & Beras',
    buyPrice: 48000,
    sellPrice: 53000,
    stock: 12,
    minStock: 4,
    unit: 'Papan',
    emoji: '🥚',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    code: '8998866200115',
    name: 'Indomie Goreng Spesial',
    category: 'Makanan Ringan',
    buyPrice: 2700,
    sellPrice: 3500,
    stock: 96,
    minStock: 20,
    unit: 'Bungkus',
    emoji: '🍜',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    code: '8998866200116',
    name: 'Kopi Kapal Api Spesial Mix 1 Renteng',
    category: 'Minuman',
    buyPrice: 12500,
    sellPrice: 15000,
    stock: 15,
    minStock: 5,
    unit: 'Renteng',
    emoji: '☕',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    code: '8998866200117',
    name: 'Susu Kental Manis Frisian Flag 370g',
    category: 'Minuman',
    buyPrice: 10500,
    sellPrice: 12500,
    stock: 4, // Low stock alert!
    minStock: 8,
    unit: 'Kaleng',
    emoji: '🥛',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    code: '8998866200118',
    name: 'Kecap Bango Manis Refill 520ml',
    category: 'Bumbu & Dapur',
    buyPrice: 19000,
    sellPrice: 22500,
    stock: 14,
    minStock: 5,
    unit: 'Pouch',
    emoji: '🥢',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    code: '8998866200119',
    name: 'Sabun Mandi Lifebuoy Total 10 85g',
    category: 'Kebutuhan Mandi',
    buyPrice: 3800,
    sellPrice: 5000,
    stock: 3, // Low stock alert!
    minStock: 10,
    unit: 'Pcs',
    emoji: '🧼',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    code: '8998866200120',
    name: 'Sunlight Pencuci Piring Jeruk Nipis 750ml',
    category: 'Perlengkapan Rumah',
    buyPrice: 14000,
    sellPrice: 17000,
    stock: 9,
    minStock: 5,
    unit: 'Pouch',
    emoji: '🍋',
    updatedAt: new Date().toISOString(),
  },
];

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      saveStoredProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getStoredStoreProfile(): StoreProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_STORE_PROFILE;
  } catch {
    return DEFAULT_STORE_PROFILE;
  }
}

export function saveStoredStoreProfile(profile: StoreProfile): void {
  localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(profile));
}

export function executeCheckout(
  transaction: Transaction
): { success: boolean; error?: string } {
  try {
    const products = getStoredProducts();
    const updatedProducts = [...products];

    for (const item of transaction.items) {
      const idx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        updatedProducts[idx] = {
          ...updatedProducts[idx],
          stock: Math.max(0, updatedProducts[idx].stock - item.quantity),
          updatedAt: new Date().toISOString(),
        };
      }
    }

    saveStoredProducts(updatedProducts);
    const transactions = getStoredTransactions();
    saveStoredTransactions([transaction, ...transactions]);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function executeVoidTransaction(
  transactionId: string
): { success: boolean; error?: string } {
  try {
    const transactions = getStoredTransactions();
    const targetIdx = transactions.findIndex((t) => t.id === transactionId);
    if (targetIdx === -1) {
      return { success: false, error: 'Transaksi tidak ditemukan' };
    }

    const tx = transactions[targetIdx];
    if (tx.isVoid) {
      return { success: false, error: 'Transaksi sudah dibatalkan sebelumnya' };
    }

    const products = getStoredProducts();
    const updatedProducts = [...products];

    for (const item of tx.items) {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        updatedProducts[pIdx] = {
          ...updatedProducts[pIdx],
          stock: updatedProducts[pIdx].stock + item.quantity,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    transactions[targetIdx] = { ...tx, isVoid: true };

    saveStoredProducts(updatedProducts);
    saveStoredTransactions(transactions);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
