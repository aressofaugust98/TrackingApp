# AppLayout Component Documentation

## Overview
The `AppLayout` component is a responsive layout wrapper for the Personal Finance App (FinTrack). It provides a mobile-first design with a desktop sidebar navigation and mobile bottom navigation bar.

## File Location
- **Component**: [src/components/AppLayout.jsx](src/components/AppLayout.jsx)
- **Usage**: [src/App.jsx](src/App.jsx)

## Features

### 1. **Responsive Design**
- **Desktop (md+)**: Sticky sidebar on the left with full menu labels
- **Mobile (< md)**: Fixed bottom navigation bar with icons and minimal labels

### 2. **Navigation Menu Items**
The component includes four main navigation items:
- Dashboard
- Transactions
- Report
- Settings

Each item is represented with a Lucide-React icon for visual clarity.

### 3. **Active Link Styling**
- **Active State**: `bg-indigo-50 text-indigo-600` with a shadow effect
- **Inactive State**: Gray text with hover effect
- Uses React state (`activeLink`) to track the currently selected page

### 4. **Color Palette**
- **Primary Color**: Indigo/Blue (#4F46E5)
- **Background**: Light gray (#F3F4F6)
- **Text**: Gray shades for hierarchy
- **Border**: Light gray for subtle separation

## Component Structure

```
AppLayout
├── Desktop Sidebar (hidden md:flex)
│   ├── Sidebar Header (FinTrack branding)
│   ├── Navigation Menu
│   └── Sidebar Footer (version info)
├── Main Content Area (flex-1)
│   └── {children}
└── Mobile Bottom Navigation (md:hidden fixed)
    └── Navigation Menu Items
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | React.ReactNode | Content to display in the main area |

## Usage Example

```jsx
import AppLayout from './components/AppLayout';

function App() {
  return (
    <AppLayout>
      {/* Your page content here */}
      <div>
        <h1>Dashboard</h1>
        {/* Page specific content */}
      </div>
    </AppLayout>
  );
}

export default App;
```

## Tailwind CSS Classes Used

### Layout & Spacing
- `flex`, `flex-col`, `flex-row`: Flexbox layout
- `min-h-screen`, `h-screen`: Full height
- `p-4`, `p-6`, `p-8`: Padding utilities
- `pb-24`, `pb-0`: Padding bottom (for mobile overflow)

### Responsive
- `hidden md:flex`: Hide on mobile, show on desktop
- `md:hidden`: Hide on desktop, show on mobile
- `md:w-64`: Desktop sidebar width

### Positioning
- `sticky top-0`: Sticky sidebar header
- `fixed bottom-0`: Fixed bottom navigation

### Colors
- `bg-gray-50`: Light gray background
- `bg-white`: White background
- `bg-indigo-50`: Light indigo active state
- `text-indigo-600`: Indigo text
- `text-gray-700`: Dark gray text
- `text-gray-500`: Medium gray text

### Visual Effects
- `shadow-sm`: Subtle shadow
- `border`: 1px border
- `rounded-lg`: Rounded corners (0.5rem)
- `rounded-xl`: Large rounded corners (0.75rem)
- `rounded-t-lg`: Rounded top corners

### States & Transitions
- `hover:bg-gray-50`: Hover effect
- `hover:shadow-md`: Hover shadow
- `transition-all duration-200`: Smooth transitions

## Dependencies

- **React**: For component structure and state management
- **Lucide-React**: For icon components
  - `LayoutDashboard`: Dashboard icon
  - `ArrowRightLeft`: Transactions icon
  - `PieChart`: Report icon
  - `Settings`: Settings icon
- **Tailwind CSS**: For styling and responsive design

## Responsive Breakpoints

| Breakpoint | Window Size | Layout |
|------------|------------|--------|
| Mobile | < 768px | Bottom navigation, full-width content |
| Tablet (md) | ≥ 768px | Left sidebar, main content area |
| Desktop | ≥ 1024px | Full sidebar with all text visible |

## State Management

The component uses React's `useState` hook to manage:
- `activeLink`: Tracks the currently selected navigation item (default: 'dashboard')

Navigation between items updates this state, highlighting the active link.

## Styling Approach

The component uses Tailwind CSS utility classes for:
- Modern, clean design
- Consistent spacing and sizing
- Smooth transitions and hover effects
- Responsive behavior without custom media queries
- Soft shadows and rounded corners

## Future Enhancements

Possible improvements:
1. Add active route detection (React Router integration)
2. Add nested menu items for advanced navigation
3. Theme switching (light/dark mode)
4. User profile section in sidebar
5. Collapsible sidebar on desktop
6. Animation for navigation transitions
7. Breadcrumb navigation for desktop

## Accessibility

The component includes:
- Semantic HTML (`nav`, `aside`, `main`)
- `title` attributes on mobile nav items
- Clear visual hierarchy
- Keyboard accessible buttons (native `<button>` elements)

## Performance Considerations

- Uses functional component with hooks
- Minimal re-renders with local state
- CSS-in-JS via Tailwind (no CSS-in-JS library overhead)
- SVG icons (efficient rendering)
