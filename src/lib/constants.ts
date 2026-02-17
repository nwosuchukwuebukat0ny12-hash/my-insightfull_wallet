import { Category, CategoryType, PaymentMethod } from './types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: 'category-food' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: 'category-transport' },
  { id: 'rent', name: 'Rent', icon: '🏠', color: 'category-rent' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: 'category-utilities' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: 'category-entertainment' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'category-shopping' },
  { id: 'health', name: 'Health', icon: '🏥', color: 'category-health' },
  { id: 'education', name: 'Education', icon: '📚', color: 'category-education' },
  { id: 'savings', name: 'Savings', icon: '💰', color: 'category-savings' },
  { id: 'other', name: 'Other', icon: '📦', color: 'category-other' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: string }[] = [
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'card', name: 'Card', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'mobile_money', name: 'Mobile Money', icon: '📱' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const getCategoryById = (id: CategoryType): Category => {
  return CATEGORIES.find((cat) => cat.id === id) || CATEGORIES[CATEGORIES.length - 1];
};

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';
