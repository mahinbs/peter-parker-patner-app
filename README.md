# Valet Partner App

A comprehensive mobile-first web application for valet partners to manage parking requests, locations, vehicle custody, and earnings.

## Features

### Authentication & Onboarding
- Phone/Email registration with OTP verification
- Password setup and login
- Multi-step registration flow

### KYC & Compliance
- Identity verification (Aadhaar/PAN/Driving License)
- Selfie with ID capture
- Driving license verification
- KYC status tracking (Pending/Approved/Rejected)

### Parking Location Management
- Add and manage multiple parking locations
- Set capacity, pricing, and vehicle type support
- Track available slots in real-time
- Configure operating hours and rules

### Dashboard
- Online/Offline toggle
- Real-time parking requests
- Active session monitoring
- Earnings overview
- Quick action buttons

### Request Management
- View incoming parking requests
- Accept/Reject requests with countdown timer
- Request details (location, vehicle type, duration, earnings)
- Direct contact with users (call/message)
- Navigation to pickup location

### Vehicle Pickup & Documentation
- Multi-angle vehicle image capture (front, back, left, right, dashboard, number plate)
- Damage/dent marking system
- Fuel level and odometer reading
- Digital handover with OTP confirmation
- Immutable documentation for dispute resolution

### Active Parking Sessions
- Real-time session monitoring
- Remaining time tracking
- Extension notifications
- Parking slot management
- Session photos

### Vehicle Return Flow
- Pre-return inspection
- Vehicle condition comparison
- Fuel and odometer verification
- Damage reporting
- User OTP confirmation
- Session completion

### Earnings & Payments
- Today/Week/Month earnings breakdown
- Transaction history
- Platform commission calculation
- Payout schedule
- Export functionality

### Profile & Settings
- Personal information management
- KYC status display
- Notification preferences
- Language selection
- Payment method setup
- Security settings
- Availability schedule

### Support & Disputes
- FAQ section
- Raise support tickets
- Dispute management
- Contact support

## Tech Stack

- **Framework**: Next.js 16.1.1
- **UI**: Tailwind CSS 4
- **Icons**: React Icons (Feather Icons)
- **Forms**: React Hook Form
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
# Example:
# NEXT_PUBLIC_API_URL=https://api.example.com
# NEXT_PUBLIC_APP_NAME=Valet Partner App
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Design System

### Color Palette
The app uses a teal-to-green gradient theme matching the logo:
- **Primary Gradient**: Teal (#14b8a6) to Green (#10b981)
- **Accent Colors**: Teal (#06b6d4), Green (#22c55e)
- **Status Colors**: 
  - Success: Green
  - Warning: Yellow/Orange
  - Error: Red
  - Info: Blue

### Typography
- **Font**: Geist Sans (via Next.js)
- **Headings**: Bold, various sizes
- **Body**: Regular weight

### Components
- Mobile-first responsive design
- Card-based layouts
- Bottom navigation for main sections
- Sidebar navigation for quick access
- Consistent button styles and form inputs

## Project Structure

```
app/
├── auth/              # Authentication pages
│   ├── login/
│   └── register/
├── kyc/               # KYC verification flow
│   ├── identity/
│   ├── qualification/
│   └── status/
├── dashboard/         # Main dashboard
├── parking-locations/ # Location management
├── requests/          # Request handling
├── pickup/            # Vehicle pickup flow
├── sessions/          # Active parking sessions
├── return/            # Vehicle return flow
├── earnings/          # Earnings dashboard
├── profile/           # User profile
├── settings/          # App settings
├── support/           # Support & disputes
├── components/        # Reusable components
│   ├── MobileLayout.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
└── store/             # State management
    └── useAuthStore.ts
```

## Key Features Implementation

### Mobile-First Design
- Optimized for mobile devices (max-width: 448px)
- Touch-friendly buttons and inputs
- Bottom navigation bar
- Responsive cards and layouts

### Real-Time Updates
- Live countdown timers for requests
- Real-time session tracking
- Dynamic slot availability
- Earnings updates

### Image Capture
- Camera integration ready
- File upload support
- Image preview and management
- Multi-image capture workflow

### State Management
- Zustand for global state
- Local state for forms and UI
- Persistent authentication state

## Future Enhancements

- QR-based handover verification
- AI damage detection
- GPS tracking integration
- Push notifications
- Real-time chat
- Advanced analytics
- Heatmap-based demand insights
- Insurance claim integration

## Troubleshooting

### Build Errors

If you encounter TypeScript errors during build:
- Ensure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`
- Check for type errors: `npm run build`

### Common Issues

- **Port already in use**: Change the port with `npm run dev -- -p 3001`
- **Module not found**: Delete `node_modules` and `package-lock.json`, then run `npm install`
- **Type errors**: Ensure TypeScript version matches project requirements

## Contributing

This is a private project. Please follow the existing code style and patterns when making changes.

## License

Private - All rights reserved
