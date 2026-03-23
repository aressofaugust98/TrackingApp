import {
  Pizza,
  Car,
  ShoppingBag,
  Wallet,
  Receipt,
  Film,
  Plane,
  Gift,
} from 'lucide-react';

export const CATEGORY_STYLES = {
  Food: { icon: Pizza, bg: 'bg-amber-50', color: 'text-amber-600' },
  Transport: { icon: Car, bg: 'bg-sky-50', color: 'text-sky-600' },
  Shopping: { icon: ShoppingBag, bg: 'bg-fuchsia-50', color: 'text-fuchsia-600' },
  Salary: { icon: Wallet, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  Utilities: { icon: Receipt, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  Entertainment: { icon: Film, bg: 'bg-purple-50', color: 'text-purple-600' },
  Travel: { icon: Plane, bg: 'bg-cyan-50', color: 'text-cyan-600' },
  Gifts: { icon: Gift, bg: 'bg-rose-50', color: 'text-rose-600' },
};

export const CATEGORY_FALLBACK = {
  icon: Wallet,
  bg: 'bg-slate-50',
  color: 'text-slate-600',
};

export const CATEGORY_OPTIONS = Object.keys(CATEGORY_STYLES).map((key) => ({
  label: key,
  value: key,
}));
