# FinTrack - Quick Reference Card

## 🚀 Getting Started (30 seconds)

```bash
cd my-react-app
npm run dev
```

Then open: **http://localhost:5174/**

---

## 📱 AppLayout Component

### Import
```jsx
import AppLayout from './components/AppLayout'
```

### Usage
```jsx
<AppLayout>
  <div className="p-6 md:p-8">
    {/* Your content here */}
  </div>
</AppLayout>
```

### Navigation Items
1. Dashboard (LayoutDashboard)
2. Transactions (ArrowRightLeft)
3. Report (PieChart)
4. Settings (Settings)

---

## 🎨 Color Palette Quick Reference

| Element | Light | Dark |
|---------|-------|------|
| Primary Text | `text-gray-900` | `text-white` |
| Secondary Text | `text-gray-600` | `text-gray-300` |
| Tertiary Text | `text-gray-500` | `text-gray-400` |
| Primary Button | `bg-indigo-600` | `bg-indigo-500` |
| Active State | `bg-indigo-50 text-indigo-600` | `bg-indigo-900 text-indigo-200` |
| Background | `bg-gray-50` | `bg-gray-900` |
| Surface | `bg-white` | `bg-gray-800` |

---

## 📐 Spacing Quick Reference

| Class | Size | Use Case |
|-------|------|----------|
| `p-4` | 1rem (16px) | Small padding |
| `p-6` | 1.5rem (24px) | Standard padding |
| `p-8` | 2rem (32px) | Large padding |
| `gap-4` | 1rem (16px) | Small gap |
| `gap-6` | 1.5rem (24px) | Standard gap |
| `mb-4` | 1rem (16px) | Small margin bottom |
| `mb-6` | 1.5rem (24px) | Standard margin bottom |
| `mb-8` | 2rem (32px) | Large margin bottom |

---

## 📱 Responsive Classes Cheat Sheet

| Mobile | Tablet+ (md) | Desktop (lg) |
|--------|-------------|------------|
| Default | Add `md:` prefix | Add `lg:` prefix |
| `hidden` | `md:flex` | `lg:flex` |
| `flex` | `md:hidden` | `lg:hidden` |
| `w-full` | `md:w-64` | `md:w-80` |
| `p-4` | `md:p-6` | `lg:p-8` |
| `text-xl` | `md:text-2xl` | `lg:text-3xl` |
| `grid-cols-1` | `md:grid-cols-2` | `lg:grid-cols-3` |

---

## 🎯 Common Patterns

### Card Component
```jsx
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
  {/* Content */}
</div>
```

### Button Component
```jsx
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
  Click me
</button>
```

### Section Header
```jsx
<div className="mb-8">
  <h2 className="text-2xl font-bold text-gray-900 mb-2">Section Title</h2>
  <p className="text-gray-600">Description text</p>
</div>
```

### Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

---

## 🔧 Common Customizations

### Change Primary Color (Indigo → Blue)
Find and replace in AppLayout.jsx:
- `indigo-600` → `blue-600`
- `indigo-50` → `blue-50`

### Add Menu Item
In AppLayout.jsx, add to `menuItems` array:
```jsx
{ id: 'budget', label: 'Budget', icon: TrendingUp }
```

### Change Sidebar Width
In AppLayout.jsx, change:
- `md:w-64` → `md:w-80` (wider)
- `md:w-64` → `md:w-56` (narrower)

### Hide Labels on Mobile
In AppLayout.jsx mobile nav section, change:
```jsx
<span className="text-xs font-medium">{item.label}</span>
```
to:
```jsx
<span className="hidden text-xs font-medium">{item.label}</span>
```

---

## 📚 File Locations

| File | Purpose |
|------|---------|
| `src/components/AppLayout.jsx` | Main layout component |
| `src/App.jsx` | App component using AppLayout |
| `src/index.css` | Global styles |
| `tailwind.config.js` | Tailwind configuration |
| `postcss.config.js` | PostCSS configuration |

---

## 🐛 Troubleshooting

### Tailwind classes not working
- Ensure you're in development mode: `npm run dev`
- Check that your file path matches `tailwind.config.js` content patterns
- Verify `@tailwind` directives in `src/index.css`

### Sidebar not showing on desktop
- Ensure viewport is ≥768px (md breakpoint)
- Check that `hidden md:flex` class is correct
- Verify no parent has `overflow-hidden`

### Mobile bottom nav hidden
- Ensure viewport is <768px
- Check that `md:hidden` class is correct
- Verify z-index isn't blocked by other elements

### Icons not displaying
- Check that lucide-react is installed: `npm list lucide-react`
- Verify correct import: `from 'lucide-react'`
- Ensure icon names are spelled correctly

---

## 📊 Breakpoints Reference

| Device | Width | Class |
|--------|-------|-------|
| Mobile | <768px | (default) |
| Tablet | 768px-1023px | `md:` |
| Desktop | ≥1024px | `lg:` |

---

## 🎨 Shadow Reference

| Class | Usage |
|-------|-------|
| `shadow-sm` | Subtle depth (cards, sidebar) |
| `shadow-md` | Medium depth (hover effects) |
| `shadow-lg` | Strong depth (bottom nav) |
| `shadow-xl` | Very strong depth (modals) |

---

## 💫 Transition Classes

```jsx
// Standard transition
transition-all duration-200

// Color transition
transition-colors duration-200

// Shadow transition
transition-shadow duration-200

// Custom transitions
transition duration-300
```

---

## 🔐 Best Practices

✅ **Do:**
- Use Tailwind utility classes for styling
- Keep components small and focused
- Use semantic HTML (`nav`, `aside`, `main`)
- Test on mobile and desktop
- Comment complex JSX sections
- Keep documentation updated

❌ **Don't:**
- Mix inline styles with Tailwind classes
- Create new CSS files unnecessarily
- Hardcode breakpoints in JavaScript
- Ignore accessibility requirements
- Skip testing responsive behavior
- Remove Tailwind directives from CSS

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| App won't start | Check Node version, run `npm install` |
| Port already in use | Vite will try next port automatically |
| Styles not updating | Refresh browser, check file is saved |
| Icons not showing | Verify lucide-react is installed |
| Mobile nav wrong height | Adjust `pb-24` in AppLayout main |
| Sidebar too wide/narrow | Change `md:w-64` to desired width |

---

## 📖 Documentation Files

- **DOCUMENTATION_INDEX.md** - Index of all docs
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **QUICK_START.md** - Getting started guide
- **COMPONENT_DOCUMENTATION.md** - Detailed docs
- **CUSTOMIZATION_GUIDE.md** - How to customize
- **VISUAL_STRUCTURE_GUIDE.md** - Design diagrams
- **README_FINTRACK.md** - Project README

---

## 🎯 Next Steps

1. ✅ Understand the layout → Read QUICK_START.md
2. ✅ Customize colors/styles → Check CUSTOMIZATION_GUIDE.md
3. ✅ Create page components → Use AppLayout pattern
4. ✅ Add routing → Integrate React Router
5. ✅ Connect API → Add data fetching
6. ✅ Deploy → Build and host

---

**Ready to build? Start with `npm run dev` and open http://localhost:5174/ 🚀**
