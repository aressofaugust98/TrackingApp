# FinTrack - Personal Finance App

A modern, mobile-first personal finance app built with React, Tailwind CSS, and Lucide-React icons.

## Project Overview

FinTrack is designed to help users manage their personal finances with a clean, intuitive interface. The app features a responsive layout that adapts seamlessly between mobile and desktop devices.

## Features

✨ **Key Features:**
- 📱 Mobile-first responsive design
- 🎨 Modern UI with Indigo/Blue color palette
- 🔄 Smooth navigation with desktop sidebar and mobile bottom navigation
- 📊 Dashboard for financial overview
- 💳 Transaction tracking
- 📈 Detailed reports
- ⚙️ Settings configuration

## Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Icons**: Lucide-React 0.563.0
- **PostCSS**: For CSS processing
- **Autoprefixer**: For vendor prefixes

## Project Structure

```
my-react-app/
├── src/
│   ├── components/
│   │   └── AppLayout.jsx          # Main layout component
│   ├── App.jsx                    # Root app component
│   ├── App.css                    # App styles
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles with Tailwind directives
├── public/                        # Static assets
├── package.json                   # Project dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
└── index.html                     # HTML entry point
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   - Local: http://localhost:5174/
   - Network: Check terminal output for network URL

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## AppLayout Component

The `AppLayout` component is the main container for the app's navigation and content.

### Features:
- **Desktop Navigation** (md+ breakpoint): Sticky sidebar on the left
- **Mobile Navigation** (< md breakpoint): Fixed bottom navigation bar
- **Active Link Highlighting**: Indigo background and text color
- **Smooth Transitions**: All interactive elements have smooth transitions

### Navigation Items:
1. **Dashboard** - Overview of finances
2. **Transactions** - List and manage transactions
3. **Report** - View detailed financial reports
4. **Settings** - Application settings

### Usage:
```jsx
import AppLayout from './components/AppLayout';

function App() {
  return (
    <AppLayout>
      {/* Your page content here */}
    </AppLayout>
  );
}
```

## Responsive Breakpoints

| Device | Breakpoint | Navigation |
|--------|-----------|------------|
| Mobile | < 768px | Bottom navigation bar |
| Tablet | 768px - 1023px | Left sidebar |
| Desktop | ≥ 1024px | Left sidebar (sticky) |

## Color Palette

| Color | Usage | Tailwind Class |
|-------|-------|----------------|
| Indigo | Primary, active states | `indigo-600`, `indigo-50` |
| White | Sidebar, cards | `white` |
| Gray | Text, backgrounds, borders | `gray-50`, `gray-200`, `gray-600` |

## Styling with Tailwind CSS

The project uses Tailwind CSS for all styling. Key utility classes include:

- **Layout**: `flex`, `grid`, `fixed`, `sticky`
- **Responsive**: `md:`, `lg:` prefixes
- **Colors**: `bg-`, `text-`, `border-`
- **Effects**: `shadow-`, `rounded-`, `transition-`

### Tailwind Configuration
- Content paths configured in `tailwind.config.js`
- PostCSS processing in `postcss.config.js`
- Global styles in `src/index.css` with Tailwind directives

## Icons

All icons are from Lucide-React:
- `LayoutDashboard` - Dashboard
- `ArrowRightLeft` - Transactions
- `PieChart` - Reports
- `Settings` - Settings

## Development Workflow

### Hot Module Replacement (HMR)
Changes to files are automatically reflected in the browser without a full page reload.

### ESLint
Run lint checks:
```bash
npm run lint
```

### Building
Create an optimized production build:
```bash
npm run build
```

The build output will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Vite's fast cold start and HMR
- Tailwind CSS with PurgeCSS (removes unused styles in production)
- SVG icons from Lucide-React (lightweight)
- React 19 optimizations
- Code splitting and lazy loading ready

## Accessibility

The AppLayout component includes:
- Semantic HTML elements (`nav`, `aside`, `main`)
- Keyboard accessible buttons
- Clear visual hierarchy
- Proper color contrast
- ARIA labels (can be enhanced further)

## Future Enhancements

- [ ] Route-based navigation (React Router integration)
- [ ] Authentication system
- [ ] Dark mode support
- [ ] User profile management
- [ ] Transaction data persistence
- [ ] Charts and analytics
- [ ] Mobile app wrapper (React Native)
- [ ] Backend API integration
- [ ] Unit and integration tests
- [ ] E2E testing

## Troubleshooting

### Port Already in Use
If port 5174 is already in use, Vite will automatically try the next available port.

### Tailwind CSS not working
Ensure:
1. `tailwind.config.js` is properly configured
2. `@tailwind` directives are in `src/index.css`
3. Run `npm install tailwindcss postcss autoprefixer` if needed

### Icons not showing
Verify lucide-react is installed:
```bash
npm install lucide-react
```

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

## License

This project is open source and available under the MIT License.

## Author

FinTrack Development Team

---

**Happy coding! 🚀**
