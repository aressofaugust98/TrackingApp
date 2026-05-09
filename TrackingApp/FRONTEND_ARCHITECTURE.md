# FinTrack Frontend Architecture & Technical Summary

This document outlines the frontend architecture, technology stack, and features of the FinTrack application, designed to serve as a comprehensive reference for project reporting.

## 1. Technology Stack

The frontend application is built using a modern, performance-oriented JavaScript ecosystem:

- **Core Framework:** React 19 (Functional Components, Hooks)
- **Build Tool / Bundler:** Vite 7 (using `@vitejs/plugin-react-swc` for ultra-fast compilation)
- **Styling:** Tailwind CSS (via PostCSS)
- **Icons:** `lucide-react` (Vector graphic icons)
- **Data Visualization:** `recharts` (Used for budgeting and financial reports)
- **Linter:** ESLint 9 (with React Hooks & React Refresh rules for code quality)

## 2. Global Architecture and Routing

Rather than relying on an external dependency like `react-router-dom`, routing and view management are handled via high-level State Management inside the main `App.jsx` component.

- **Authentication State:** Global application entry depends on `isAuthenticated` (validated via access tokens in `localStorage`).
- **View Routing:** The application transitions between functional modules based on the `appSection` state (e.g., `dashboard`, `transactions`, `reports`, `budget`, `onboarding`).
- **Layout Wrapper:** The `AppLayout.jsx` provides a consistent shell (navigation, sidebars, headers) wrapping the dynamically rendered page components.

## 3. Directory Structure

The `src/` directory employs a feature-by-type domain structure:

```text
src/
├── assets/         # Static images, icons, and global graphical assets
├── components/     # Reusable UI elements (BalanceCard, TransactionForm, InAppScanner, etc.)
├── constants/      # Shared configuration and static data (categories, sample data)
├── pages/          # Top-level view modules mapping to app sections (Dashboard, BudgetPage, etc.)
├── services/       # API integration layer mapping to backend endpoints
└── utils/          # Global helper functions and configurations (apiClient.js, apiConfig.js)
```

## 4. Key Features & Modules

### 1. Authentication & Onboarding
- **Login & Registration:** Handled via `LoginPage.jsx` and `RegisterPage.jsx` interacting with `authService.js`.
- **First-time Onboarding:** The `OnboardingPage.jsx` guides users to set up initial wallets right after registration before accessing the main dashboard.

### 2. Dashboard & Wallets
- **High-level Summary:** The `Dashboard.jsx` provides an immediate overview of financial health, calling upon components like `BalanceCard.jsx` and `RecentTransactions.jsx`.
- **Wallet Management:** Users can manage multiple financial accounts/wallets (`WalletManager.jsx` & `walletService.js`).

### 3. Transaction Management
- **Manual Entry:** `TransactionForm.jsx` enables users to input expenses and incomes directly.
- **Transaction Listing:** `TransactionList.jsx` and `TransactionsPage.jsx` display historical records with built-in filtering and categorization.
- **In-App Receipt Scanner:** The `InAppScanner.jsx` uses `ocrService.js` to automatically extract transaction data from uploaded receipts or captures.

### 4. Reporting & Budgeting
- **Data Visualizations:** The `ReportsPage.jsx` utilizes `recharts` to render visual representations of spending habits across customizable timeframes.
- **Budget Tracking:** The `BudgetPage.jsx` compares actual expenditures against defined limits by category.

### 5. AI Chatbot Assistant
- The `Chatbot.jsx` (powered by `chatService.js`) provides an integrated, conversational UI for fetching financial insights or interacting with the tracking data seamlessly.

## 5. Data Flow and State Management

1. **Local State (Hooks):** Global concerns (user authentication, active layout, initial wallets payload) map to `useState` and `useEffect` within `App.jsx`.
2. **Prop Drilling:** Because the application depth is relatively flat, state is passed down to generic components directly from `App.jsx` or specialized Page components.
3. **API Abstract Layer:** External communication is centralized in the `services/` directory. Each domain (Authentication, Transactions, Wallet) provides asynchronous fetch routines wrapped tightly around `utils/apiClient.js`, promoting DRY (Don't Repeat Yourself) API calls, decoupled error propagation, and global interceptor handling (e.g., token injections).
