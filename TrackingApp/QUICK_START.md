# Quick Start Guide - AppLayout Component

## Overview
This guide helps you quickly integrate and use the AppLayout component in your pages.

## Basic Usage

### Step 1: Import the Component
```jsx
import AppLayout from './components/AppLayout';
```

### Step 2: Wrap Your Content
```jsx
function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {/* Your content here */}
      </div>
    </AppLayout>
  );
}
```

## Navigation State

The AppLayout component maintains active navigation state internally. The active link is determined by the `activeLink` state.

**Navigation Items:**
- `dashboard` - Dashboard
- `transactions` - Transactions
- `report` - Report
- `settings` - Settings

## Styling Your Content

### Content Container Padding
```jsx
// Standard padding
<div className="p-6 md:p-8">
  {/* Content */}
</div>

// With max-width constraint
<div className="p-6 md:p-8">
  <div className="max-w-6xl mx-auto">
    {/* Content */}
  </div>
</div>
```

### Common Component Patterns

#### Card Component
```jsx
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
  <h3 className="font-semibold text-gray-900">Card Title</h3>
  <p className="text-gray-600 text-sm mt-2">Card description</p>
</div>
```

#### Section Header
```jsx
<div>
  <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Title</h1>
  <p className="text-gray-600 mb-8">Subtitle or description</p>
</div>
```

#### Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Card items */}
</div>
```

## Responsive Design Examples

### Mobile-Only Content
```jsx
<div className="md:hidden">
  Mobile-only content
</div>
```

### Desktop-Only Content
```jsx
<div className="hidden md:block">
  Desktop-only content
</div>
```

### Responsive Text Sizes
```jsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

### Responsive Padding
```jsx
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

## Color Usage

### Primary Colors (Indigo)
```jsx
// Text
<p className="text-indigo-600">Indigo text</p>

// Background
<div className="bg-indigo-50">Light indigo background</div>
<div className="bg-indigo-600">Dark indigo background</div>

// Hover effects
<button className="hover:text-indigo-600">Hover text</button>
```

### Neutral Colors
```jsx
// Background
<div className="bg-gray-50">Light gray background</div>
<div className="bg-white">White background</div>

// Text
<p className="text-gray-900">Dark text</p>
<p className="text-gray-600">Medium text</p>
<p className="text-gray-500">Light text</p>
```

## Interactive Elements

### Button Styling
```jsx
// Primary Button
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
  Click me
</button>

// Secondary Button
<button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
  Cancel
</button>
```

### Link Styling
```jsx
<a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
  Click here
</a>
```

## Spacing Guidelines

### Padding
- Mobile: `p-4` or `p-6`
- Desktop: `p-6` or `p-8`
- Use responsive: `p-4 md:p-6 lg:p-8`

### Margins
```jsx
// Heading spacing
<h1 className="mb-2">Title</h1>
<p className="mb-8">Subtitle</p>

// Between sections
<div className="mb-6">
  Section content
</div>
```

### Gaps (Grid/Flex)
```jsx
// Common gaps
<div className="grid gap-4 md:gap-6">
  {/* Items */}
</div>
```

## Icons from Lucide-React

### Importing Icons
```jsx
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  Settings,
  Plus,
  Trash2,
  Edit,
  Search
} from 'lucide-react';
```

### Using Icons
```jsx
// Standard size
<LayoutDashboard size={24} />

// Small size
<Settings size={20} />

// Large size
<Plus size={32} />

// With text
<button className="flex items-center gap-2">
  <Plus size={20} />
  Add Item
</button>
```

## Mobile Layout Considerations

### Safe Areas on Mobile
The AppLayout adds `pb-24` to content to prevent overlap with bottom navigation:
```jsx
// Content automatically has pb-24 on mobile
<main className="flex-1 pb-24 md:pb-0">
  {/* Content is safely above bottom nav */}
</main>
```

### Touch-Friendly Sizes
- Button/tap targets: 44x44px minimum (ensure with `p-3` or `h-12`)
- Icon size: 24px for navigation, 20px for inline

## Performance Tips

1. **Lazy Load Components**
   ```jsx
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   ```

2. **Memoize Complex Components**
   ```jsx
   export default React.memo(MyComponent);
   ```

3. **Use Key Prop in Lists**
   ```jsx
   {items.map(item => (
     <div key={item.id}>{item.name}</div>
   ))}
   ```

## Troubleshooting

### Content Hidden Behind Bottom Nav (Mobile)
- Ensure content is inside `AppLayout` 
- `AppLayout` automatically adds `pb-24` to main content

### Sidebar Not Sticky (Desktop)
- Sidebar is set to `sticky top-0`
- Ensure no overflow-hidden on parent containers

### Icons Not Displaying
- Check lucide-react is installed: `npm install lucide-react`
- Verify import path: `from 'lucide-react'`

### Tailwind Classes Not Working
- Run: `npm run dev` (development mode)
- Check `tailwind.config.js` content paths
- Verify classes are in `src/**/*.{js,jsx,ts,tsx}`

## Next Steps

1. Create new page components
2. Add your content inside AppLayout
3. Style using Tailwind utility classes
4. Test on mobile and desktop
5. Deploy to production

---

**Happy building! 🚀**
