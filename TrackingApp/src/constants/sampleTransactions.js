const createDateString = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const SAMPLE_TRANSACTIONS = [
  {
    id: 'txn-1',
    category: 'Salary',
    note: 'Lương tháng 1',
    amount: 25000000,
    type: 'income',
    date: createDateString(0),
    time: '09:00',
    wallet: '2',
  },
  {
    id: 'txn-2',
    category: 'Food',
    note: 'Bữa sáng Phở Thìn',
    amount: 75000,
    type: 'expense',
    date: createDateString(0),
    time: '07:45',
    wallet: '1',
  },
  {
    id: 'txn-3',
    category: 'Transport',
    note: 'GrabCar tới công ty',
    amount: 90000,
    type: 'expense',
    date: createDateString(0),
    time: '08:20',
    wallet: '1',
  },
  {
    id: 'txn-4',
    category: 'Shopping',
    note: 'Áo sơ mi Uniqlo',
    amount: 650000,
    type: 'expense',
    date: createDateString(1),
    time: '18:30',
    wallet: '2',
  },
  {
    id: 'txn-5',
    category: 'Entertainment',
    note: 'CGV cuối tuần',
    amount: 320000,
    type: 'expense',
    date: createDateString(2),
    time: '20:10',
    wallet: '2',
  },
  {
    id: 'txn-6',
    category: 'Utilities',
    note: 'Hoá đơn internet',
    amount: 280000,
    type: 'expense',
    date: createDateString(3),
    time: '10:05',
    wallet: '1',
  },
  {
    id: 'txn-7',
    category: 'Travel',
    note: 'Vé máy bay Đà Nẵng',
    amount: 4800000,
    type: 'expense',
    date: createDateString(5),
    time: '11:15',
    wallet: '2',
  },
];

export default SAMPLE_TRANSACTIONS;
