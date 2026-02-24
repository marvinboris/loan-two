# CFAfrica - Credit Platform

A monorepo for a micro-lending and credit management platform for Africa, built with Nx, React Native/Expo, and Node.js.

## Apps

| App             | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| `api`           | Node.js/Express REST API with PostgreSQL (Sequelize ORM), JWT auth, Twilio SMS     |
| `customer`      | React Native/Expo app for loan customers (login, OTP, applications, beneficiaries) |
| `collection`    | React Native/Expo app for debt collection agents                                   |
| `telemarketing` | React Native/Expo app for telemarketing                                            |
| `admin`         | Web admin panel (Firebase)                                                         |

## Packages

| Package | Description                                                 |
| ------- | ----------------------------------------------------------- |
| `utils` | Shared utilities, i18n (en/fr), country data, HTTP client   |
| `types` | Shared TypeScript types                                     |
| `hooks` | Custom React hooks (useAuth, useApi, usePaginatedApi, etc.) |

## Tech Stack

- **Frontend**: React Native, Expo, React Router DOM, TailwindCSS
- **Backend**: Node.js, Express, Sequelize, PostgreSQL
- **Auth**: JWT, Twilio (SMS), OTP
- **State**: LegendApp State, React Context
- **i18n**: i18next
- **Database**: PostgreSQL with Sequelize ORM, MySQL2

## Getting Started

```bash
# Install dependencies
pnpm install

# Run API
npx nx serve api

# Run customer app
npx nx serve customer

# Run collection app
npx nx serve collection

# Run telemarketing app
npx nx serve telemarketing

# Build customer APK
pnpm build-customer
```

## Scripts

```bash
# Seed database
pnpm seed:all        # Seed all data
pnpm seed:users      # Seed users
pnpm seed:customers  # Seed customers
pnpm seed:loans      # Seed loans

# Build apps
pnpm build-customer
pnpm build-collection
pnpm build-telemarketing

# Deploy
pnpm deploy-admin    # Deploy admin to Firebase
```

test
