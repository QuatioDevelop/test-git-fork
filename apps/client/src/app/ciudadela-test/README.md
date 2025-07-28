# Ciudadela Test - Feature Validation Page

## Overview

The `/ciudadela-test` route provides a comprehensive testing interface for validating all the features of the SURA Esencia Fest 2025 virtual event platform. This page includes the full Ciudadela canvas with an integrated Feature Validation Checklist.

## Key Features

### 1. **Full Ciudadela Canvas**
- Interactive virtual city navigation
- All 5 main rooms + 4 transversal rooms
- Real-time room availability status
- Progress tracking visualization

### 2. **Feature Validation Checklist**
A comprehensive checklist covering:

#### Authentication & User Management
- User authentication (JWT)
- Complete user data (name, lastname, country, negocio)
- Logout functionality

#### Navigation & Routing
- Navigation from Ciudadela to rooms
- Protected routes with authentication
- Home button functionality in rooms

#### Room Content Validation
- **Sala 1 (Patrocinio)**: Vimeo video player with completion tracking
- **Sala 2 (Conocimiento)**: Genially iframe content
- **Sala 3 (Ideas en Acción)**: Forum functionality (create/view posts)
- **Sala 4 (Salón de la Fama)**: 360° cylindrical gallery with 15 frames
- **Sala 5 (Inspiración)**: Live streaming with Vimeo + chat iframe

#### Progress & State Management
- Progress tracking system
- Correct percentage calculations
- Backend persistence of user progress

#### Room Schedule Management
- Time-based room availability
- Manual override from admin panel

#### UI/UX
- Responsive design (mobile/tablet/desktop)
- Appropriate loading states
- User-friendly error handling

### 3. **Interactive Features**
- Toggle button to show/hide checklist
- Auto-check functionality for verifiable items
- Manual check for UI/UX items
- "Run All Tests" button for batch validation
- Direct navigation links to test specific rooms

### 4. **Real-time Status Updates**
- Progress percentage visualization
- Color-coded status indicators:
  - ✅ Green: Verified/Success
  - ⚠️ Yellow: Warning/Partial
  - ❌ Red: Error/Failed
  - ⭕ Gray: Pending

## Usage

1. **Access the page**: Navigate to `/ciudadela-test` (requires authentication)
2. **View checklist**: Click "Mostrar Checklist" button (top-right)
3. **Run automated tests**: Click "Ejecutar Tests" to run all auto-checks
4. **Test individual features**: Click "Probar" links next to items
5. **Manual verification**: Click checkboxes for UI/UX items

## Technical Implementation

- **Component**: `FeatureValidationChecklist` with React hooks
- **Auto-checks**: Uses context providers (Auth, Progress, Rooms)
- **State management**: Local state with real-time updates
- **Icons**: Lucide React for visual clarity
- **Styling**: Tailwind CSS with hover/transition effects

## Testing Workflow

1. **Authentication Flow**
   - Login with test credentials
   - Verify user data display
   - Test logout functionality

2. **Room Navigation**
   - Click each room in Ciudadela
   - Verify correct routing
   - Test home button in each room

3. **Content Validation**
   - Visit each room
   - Verify specific content loads
   - Check progress tracking

4. **Admin Features**
   - Test room schedule controls
   - Verify manual overrides
   - Check real-time updates

## Notes

- This is a development/testing tool - not for production
- Requires authentication to access
- All auto-checks run on component mount and data changes
- Manual checks persist in local component state only