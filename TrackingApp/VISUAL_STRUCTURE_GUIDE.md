# AppLayout - Visual Structure Guide

## Desktop View (md+ / 768px+)

```
┌─────────────────────────────────────────────────────────┐
│                      FinTrack                            │
│            Personal Finance App                          │
├──────────────────┬──────────────────────────────────────┤
│                  │                                        │
│  SIDEBAR         │        MAIN CONTENT AREA              │
│  (sticky)        │        (light gray background)        │
│  w-64            │                                        │
│  (256px)         │                                        │
│                  │                                        │
│  ┌────────────┐  │        ┌─────────────────────┐       │
│  │ Dashboard  │  │        │    Dashboard        │       │
│  └────────────┘  │        │    Welcome Page     │       │
│                  │        │                     │       │
│  ┌────────────┐  │        └─────────────────────┘       │
│  │Transaction │  │                                        │
│  │     s      │  │        ┌─────┬─────┬─────┐           │
│  └────────────┘  │        │Card │Card │Card │           │
│                  │        └─────┴─────┴─────┘           │
│  ┌────────────┐  │                                        │
│  │   Report   │  │        ┌─────┬─────┬─────┐           │
│  └────────────┘  │        │Card │Card │Card │           │
│                  │        └─────┴─────┴─────┘           │
│  ┌────────────┐  │                                        │
│  │ Settings   │  │                                        │
│  └────────────┘  │                                        │
│                  │                                        │
│  v1.0.0          │                                        │
│                  │                                        │
└──────────────────┴──────────────────────────────────────┘
```

### Desktop Features
- Sidebar width: 256px (w-64)
- Sticky positioning (stays visible while scrolling)
- White background with subtle border
- Menu items: 4 items with icons + labels
- Active item: Indigo background (bg-indigo-50), indigo text (text-indigo-600)
- Hover effect: Light gray background
- Border radius: Rounded corners (rounded-lg)
- Shadows: Subtle shadow (shadow-sm)

---

## Mobile View (< 768px)

```
┌─────────────────────────────────────┐
│                                     │
│        MAIN CONTENT AREA            │
│        (light gray background)      │
│                                     │
│        ┌─────────────────────┐     │
│        │    Dashboard        │     │
│        │    Welcome Page     │     │
│        │                     │     │
│        └─────────────────────┘     │
│                                     │
│        ┌─────┬─────┬─────┐         │
│        │Card │Card │Card │         │
│        └─────┴─────┴─────┘         │
│                                     │
│        ┌─────┬─────┬─────┐         │
│        │Card │Card │Card │         │
│        └─────┴─────┴─────┘         │
│                                     │
│                                     │
│                                     │
│   pb-24 (padding-bottom) to        │
│   avoid overlap with bottom nav     │
│                                     │
├─────────────────────────────────────┤
│ 📊 │ 💳 │ 📈 │ ⚙️  │              │
│ Dash Transactions Report Settings  │
└─────────────────────────────────────┘
```

### Mobile Features
- Fixed bottom navigation bar (h-20 = 80px)
- Width: Full screen width
- White background with top border and shadow
- Menu items: Icons + labels (in smaller text)
- Active item: Indigo background, indigo text
- Touch-friendly sizing (80px height = 44px tap target minimum)
- Content padding: pb-24 to prevent overlap

---

## Color States

### Active Menu Item
```
Background: bg-indigo-50 (#F0F4FF - very light indigo)
Text: text-indigo-600 (#4F46E5 - medium indigo)
Effect: shadow-sm (subtle depth)
Font: font-medium (slightly bolder)
```

### Inactive Menu Item
```
Desktop Sidebar:
  Background: default (white)
  Text: text-gray-700 (#374151 - dark gray)
  Hover: bg-gray-50 (#F9FAFB - light gray)

Mobile Bottom Nav:
  Background: default (white)
  Text: text-gray-600 (#4B5563 - medium gray)
  Hover: text-indigo-600 (indigo on hover)
```

### Main Content Area
```
Background: bg-gray-50 (#F9FAFB - light gray)
Cards: bg-white (white with subtle border)
Text (primary): text-gray-900 (#111827 - dark)
Text (secondary): text-gray-600 (#4B5563 - medium)
Text (tertiary): text-gray-500 (#6B7280 - light)
```

---

## Spacing & Sizing

### Sidebar
```
Desktop Width: w-64 (256px)
Padding: p-4 or p-6
Header: p-6 with border-bottom
Footer: p-4 with border-top
Menu Items: px-4 py-3 (horizontal × vertical padding)
```

### Content Area
```
Desktop: p-8 (32px padding on all sides)
Mobile: p-6 (24px padding on all sides)
Responsive: p-4 md:p-6 lg:p-8
Gap between cards: gap-6 (24px)
Card padding: p-6
```

### Mobile Bottom Nav
```
Height: h-20 (80px)
Gap between items: flex-1 (equal distribution)
Icon size: size-24 (24px)
Text size: text-xs (12px)
Padding: py-3 (vertical)
```

---

## Component Hierarchy

```
AppLayout (Main Container)
├── Desktop Sidebar (hidden md:flex)
│   ├── Sidebar Header
│   │   ├── Brand Name "FinTrack"
│   │   └── Subtitle "Personal Finance"
│   │
│   ├── Navigation Menu (flex-1)
│   │   └── [4x Menu Items]
│   │       ├── Icon (size-5)
│   │       ├── Label (text)
│   │       └── States (active/inactive)
│   │
│   └── Sidebar Footer
│       └── Version Info "v1.0.0"
│
├── Main Content Area (flex-1)
│   └── {children}
│       └── Content with pb-24 (mobile) / pb-0 (desktop)
│
└── Mobile Bottom Navigation Bar (md:hidden fixed)
    └── [4x Menu Items]
        ├── Icon (size-6)
        ├── Label (text-xs)
        └── States (active/inactive)
```

---

## Responsive Transitions

### At md breakpoint (768px):
1. Desktop sidebar appears (`hidden md:flex`)
2. Mobile bottom navigation hides (`md:hidden`)
3. Content padding adjusts (`pb-24 md:pb-0`)
4. Sidebar becomes sticky (`sticky top-0`)
5. Main layout changes from flex-col to flex-row

### Animation/Transition
```css
transition-all duration-200
```
All interactive elements have smooth 200ms transitions for:
- Background color changes
- Text color changes
- Shadow effects
- Hover states

---

## Touch & Interaction Areas

### Mobile Tap Targets
```
Menu item button: 80px height (meets accessibility minimum)
Icon: 24px × 24px
Label: Below icon
Padding: py-3 (extra vertical space)
```

### Desktop Hover Areas
```
Sidebar menu items: Full width (w-full)
Hover expansion: Subtle (bg-gray-50)
Active indication: Clear (bg-indigo-50 text-indigo-600)
Transition: Smooth (duration-200)
```

---

## Icon Specifications

### Navigation Icons (from Lucide-React)
```
Dashboard:    LayoutDashboard (size-5 desktop, size-6 mobile)
Transactions: ArrowRightLeft (size-5 desktop, size-6 mobile)
Report:       PieChart (size-5 desktop, size-6 mobile)
Settings:     Settings (size-5 desktop, size-6 mobile)
```

### Size Guidelines
- Desktop sidebar: `size-5` (20px)
- Mobile bottom nav: `size-6` (24px)
- Inline icons: `size-4` (16px) or `size-5` (20px)
- Large icons: `size-8` (32px)

---

## Responsive Behavior Matrix

| Feature | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Sidebar | Hidden | Visible, Sticky | Visible, Sticky |
| Bottom Nav | Fixed | Hidden | Hidden |
| Content Width | Full | Full | Full |
| Content Padding | p-6 | p-8 | p-8 |
| Grid Columns | 1 | 2 | 3 |
| Font Size (h1) | text-2xl | text-3xl | text-3xl |
| Font Size (body) | text-sm | text-base | text-base |
| Overflow | Handled (pb-24) | No overlap | No overlap |

---

## Visual Hierarchy

### Typography Scale
```
H1: text-3xl font-bold text-gray-900
H2: text-2xl font-bold text-gray-900
H3: text-lg font-semibold text-gray-900
Body: text-base text-gray-700
Small: text-sm text-gray-600
Tiny: text-xs text-gray-500
```

### Shadow Hierarchy
```
None: Regular elements
shadow-sm: Cards, sidebar sections
shadow-md: Hover effects, elevated states
shadow-lg: Bottom navigation (emphasis at bottom)
```

### Color Hierarchy
```
Primary: Indigo (indigo-600) - Actions, active states
Secondary: Gray (gray-700) - Text, labels
Tertiary: Light Gray (gray-500) - Supporting text
Background: Light Gray (gray-50) - Main area
Surface: White (white) - Cards, sidebar

Accent in Cards:
- Border: border-gray-100 (very subtle)
- Hover: shadow-md (elevation)
```

---

This visual structure ensures:
- ✅ Clean, modern design
- ✅ Excellent mobile usability
- ✅ Professional desktop experience
- ✅ Consistent spacing and alignment
- ✅ Clear visual hierarchy
- ✅ Smooth transitions and interactions
