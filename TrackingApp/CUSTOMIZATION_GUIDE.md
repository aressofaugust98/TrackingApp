# AppLayout - Customization Guide

## Overview
This guide shows how to customize and extend the AppLayout component for your needs.

## Customizing Navigation Items

### Add New Menu Items
Edit [src/components/AppLayout.jsx](src/components/AppLayout.jsx) and modify the `menuItems` array:

```jsx
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
  { id: 'report', label: 'Report', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings },
  // Add new items here
  { id: 'budget', label: 'Budget', icon: TrendingUp },
  { id: 'savings', label: 'Savings', icon: PiggyBank },
];
```

### Import New Icons
```jsx
import {
  LayoutDashboard,
  ArrowRightLeft,
  PieChart,
  Settings,
  TrendingUp,      // New icon
  PiggyBank,       // New icon
} from 'lucide-react';
```

## Styling Customization

### Change Primary Color

**Option 1: Update Tailwind Config**
Edit `tailwind.config.js`:
```js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          600: '#0284c7',
          // Use your color palette
        },
      },
    },
  },
}
```

Then update component colors from `indigo-` to `primary-`.

**Option 2: Direct Class Changes**
Find and replace in `AppLayout.jsx`:
```jsx
// Search: bg-indigo-50 text-indigo-600
// Replace with: bg-blue-50 text-blue-600
```

### Custom Sidebar Colors
```jsx
// Change sidebar background
<aside className="hidden md:flex md:w-64 bg-slate-900 border-r border-slate-800">
  {/* Content */}
</aside>
```

### Change Sidebar Width
Modify the `md:w-64` class (64 = 16rem = 256px):
```jsx
// Wider sidebar
<aside className="hidden md:flex md:w-80">

// Narrower sidebar
<aside className="hidden md:flex md:w-56">
```

## Structural Customization

### Add Sidebar User Profile

```jsx
// Add after Sidebar Header
<div className="p-4 border-b border-gray-200">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
      JD
    </div>
    <div>
      <p className="font-medium text-gray-900">John Doe</p>
      <p className="text-xs text-gray-500">john@example.com</p>
    </div>
  </div>
</div>
```

### Add Search Bar
```jsx
// Add in Sidebar Header or as separate section
<div className="p-4">
  <input
    type="text"
    placeholder="Search..."
    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
</div>
```

### Collapsible Sidebar on Desktop

```jsx
// Add state
const [sidebarOpen, setSidebarOpen] = useState(true);

// Update sidebar className
<aside className={`hidden md:flex md:${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ...`}>
```

### Add Logout Button
```jsx
// In Sidebar Footer
<div className="p-4 border-t border-gray-200">
  <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
    Logout
  </button>
</div>
```

## Navigation Enhancement

### Add Active Route Detection (React Router)

Install React Router:
```bash
npm install react-router-dom
```

Update component:
```jsx
import { useLocation } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const location = useLocation();
  
  const activeLink = menuItems.find(item => {
    return location.pathname === `/${item.id}`;
  })?.id || 'dashboard';
  
  // Remove useState for activeLink
  // Component automatically updates based on route
};
```

### Add Nested Menu Items
```jsx
const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    submenu: [] // No submenu
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    submenu: [
      { id: 'spending', label: 'Spending' },
      { id: 'income', label: 'Income' },
    ]
  },
];
```

## Mobile Navigation Customization

### Hide Labels on Mobile (Icons Only)
```jsx
// Mobile Bottom Navigation
<span className="hidden text-xs font-medium">{item.label}</span>
// OR make text even smaller:
<span className="text-[10px] font-medium">{item.label}</span>
```

### Add Badges to Menu Items
```jsx
<button className="relative ...">
  <Icon size={24} />
  {item.badge && (
    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {item.badge}
    </span>
  )}
  <span className="text-xs font-medium">{item.label}</span>
</button>
```

### Animated Bottom Nav
```jsx
// Add slide-in animation
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg animate-slideIn">
```

Add to CSS:
```css
@keyframes slideIn {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

## Theme Implementation

### Light/Dark Mode Support

Add to component state:
```jsx
const [isDark, setIsDark] = useState(false);

// In JSX
<div className={isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}>
```

Or use Tailwind's dark mode:
```jsx
<div className="dark:bg-gray-900 dark:text-white bg-gray-50 text-gray-900">
```

### Theme Toggle Button
```jsx
<button onClick={() => setIsDark(!isDark)} className="p-2">
  {isDark ? <Sun size={20} /> : <Moon size={20} />}
</button>
```

## Performance Optimization

### Memoize Navigation Items
```jsx
import { useMemo } from 'react';

const AppLayout = ({ children }) => {
  const menuItems = useMemo(() => [
    // Menu items definition
  ], []);
};
```

### Lazy Load Navigation
```jsx
const Navigation = React.lazy(() => import('./Navigation'));

<Suspense fallback={<div>Loading...</div>}>
  <Navigation />
</Suspense>
```

## Accessibility Enhancements

### Add ARIA Labels
```jsx
<nav aria-label="Main navigation">
  {/* Navigation items */}
</nav>

<aside aria-label="Sidebar navigation">
  {/* Sidebar items */}
</aside>
```

### Add Skip Links
```jsx
<a href="#main-content" className="sr-only">
  Skip to main content
</a>

<main id="main-content">
  {children}
</main>
```

### Keyboard Navigation
```jsx
const handleKeyPress = (e, itemId) => {
  if (e.key === 'Enter' || e.key === ' ') {
    setActiveLink(itemId);
  }
};

<button
  onKeyPress={(e) => handleKeyPress(e, item.id)}
  role="menuitem"
>
  {/* Button content */}
</button>
```

## Animation Customization

### Smooth Menu Transitions
```jsx
// Update active link button
<button className={`... transition-all duration-200 transform ${
  isActive(item.id) ? 'scale-105' : 'scale-100'
}`}>
```

### Page Transition Animation
```jsx
<main className="animate-fadeIn">
  {children}
</main>
```

Add to CSS:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

## Example: Enhanced AppLayout

```jsx
import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  PieChart,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const EnhancedAppLayout = ({ children }) => {
  const [activeLink, setActiveLink] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'report', label: 'Report', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ], []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Enhanced Desktop Sidebar */}
      <aside className={`hidden md:flex md:${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300`}>
        <div className="w-full flex flex-col sticky top-0 h-screen">
          {/* Header with Toggle */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen && (
              <>
                <h1 className="text-2xl font-bold text-indigo-600">FinTrack</h1>
              </>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveLink(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeLink === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around h-20">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveLink(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 ${
                  activeLink === item.id
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default EnhancedAppLayout;
```

---

**Customize to your needs! 🎨**
