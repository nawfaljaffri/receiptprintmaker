export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  
  // For Comparative Mode
  secondaryName?: string;
  secondaryPrice?: number;
}

export interface ReceiptData {
  // Header
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeWebsite: string;
  
  // Details
  date: string;
  time: string;
  orderNumber: string;
  cashierName: string;
  
  // Items
  items: ReceiptItem[];
  
  // Totals & Tax
  taxRate: number; // percentage
  discount: number; // flat amount
  currencySymbol: string;
  
  // Footer
  footerMessage: string;
  
  // Visibility & Toggles
  showStoreInfo: boolean;
  showDateDetails: boolean;
  showTotals: boolean;
  showFooter: boolean;
  showBarcode: boolean;
  
  // Style config
  fontFamily: string;
  paperStyle: 'clean' | 'thermal';
  backgroundColor: string; // Used for export and preview
  textColor: string;       // Used for export and preview
  isTransparent: boolean;  // Used for export
  
  // Layout Mode
  itemLayout: 'standard' | 'comparative';
  
  // Realistic Effects (0 to 100)
  effectNoise: number;
  effectBleed: number;
  effectFade: number;
  effectCreases: number;
  effectScratches: number;
  effectWarp: number;
}

export const defaultReceiptData: ReceiptData = {
  storeName: 'PURCHASING POWER',
  storeAddress: 'AIESEC IN UNITED ARAB EMIRATES',
  storePhone: '',
  storeWebsite: '',
  
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  orderNumber: 'Brazil',
  cashierName: 'Abu Dhabi',
  
  items: [
    { id: '1', name: 'Water', quantity: 1, price: 1.00, secondaryName: 'Agua', secondaryPrice: 1.50 },
    { id: '2', name: 'Karak', quantity: 1, price: 2.00, secondaryName: 'Cafe', secondaryPrice: 3.00 },
  ],
  
  taxRate: 5.0,
  discount: 0.00,
  currencySymbol: '$',
  
  footerMessage: 'Find out how much something we know, in the\nUAE, costs in a new country and what\nthey\'re called',
  
  showStoreInfo: true,
  showDateDetails: true,
  showTotals: true,
  showFooter: true,
  showBarcode: true,
  
  fontFamily: 'monospace',
  paperStyle: 'thermal',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  isTransparent: false,
  receiptWidth: 'auto',
  
  itemLayout: 'comparative',
  
  effectNoise: 15,
  effectBleed: 20,
  effectFade: 0,
  effectCreases: 0,
  effectScratches: 0,
  effectWarp: 0,
};
