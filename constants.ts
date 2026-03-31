import { DiamondPackage, PaymentMethod } from './types';

export const DIAMOND_PACKAGES: DiamondPackage[] = [
  { id: '1', amount: 100, price: 0.99, bonus: 10 },
  { id: '2', amount: 310, price: 2.99, bonus: 31, isPopular: true },
  { id: '3', amount: 520, price: 4.99, bonus: 52 },
  { id: '4', amount: 1060, price: 9.99, bonus: 106 },
  { id: '5', amount: 2180, price: 19.99, bonus: 218 },
  { id: '6', amount: 5600, price: 49.99, bonus: 560 },
];

export const PAYMENT_METHODS: (PaymentMethod & { brands?: string[] })[] = [
  { id: 'bank', name: 'Bank Transfer', icon: 'Landmark', brands: ['BCA', 'Mandiri', 'BNI', 'BRI'] },
  { id: 'mobile', name: 'Mobile Reload', icon: 'Smartphone', brands: ['Telkomsel', 'Indosat', 'XL', 'Tri'] },
  { id: 'card', name: 'Credit/Debit Card', icon: 'CreditCard', brands: ['Visa', 'Mastercard', 'JCB'] },
  { id: 'paypal', name: 'PayPal', icon: 'CircleDollarSign', brands: ['Global Secure'] },
  { id: 'wallet', name: 'Wallet Balance', icon: 'Wallet', brands: ['Internal Credits'] },
];
