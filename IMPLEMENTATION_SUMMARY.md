# BookMyShow Frontend Implementation Summary

## What Was Done

### 1. **TanStack Query Integration**
   - Added `@tanstack/react-query` to package.json
   - Wrapped App with `QueryClientProvider` with optimized default options
   - **Caching Strategy:**
     - Movies: 5 min stale time, 30 min cache time
     - Shows: 5 min stale time, 30 min cache time
     - Seats: 2 min stale time (changes frequently), 10 min cache time

### 2. **Custom React Query Hooks**
   - `useMovies()` - Fetch and cache all movies
   - `useShowsByMovie(movieId, date)` - Fetch shows for a specific movie
   - `useShowSeats(showId)` - Fetch seats for a specific show

### 3. **SVG Seat Selection System**
   - **SvgSeatingLayout** - Main SVG component that renders the entire theater layout
   - **SvgSeat** - Individual seat component with:
     - Status-based coloring (available, booked, locked)
     - Selection feedback (blue highlight + circle indicator)
     - Responsive sizing based on screen width
     - Click handlers for selection/deselection
   - **Seat Organization Utilities:**
     - `organizeSeatsByRows()` - Groups and sorts seats by row
     - `getSeatStatusColor()` - Returns appropriate color for seat status
     - `getResponsiveDimensions()` - Calculates optimal dimensions for different screen sizes

### 4. **Responsive Design**
   - **Mobile (< 640px):**
     - Seat size: 24px, Gap: 6px
     - Padding: 16px, Font size: 10px
   - **Tablet (640px - 1024px):**
     - Seat size: 32px, Gap: 8px
     - Padding: 24px, Font size: 12px
   - **Desktop (> 1024px):**
     - Seat size: 40px, Gap: 10px
     - Padding: 32px, Font size: 14px
   - Uses Tailwind's responsive grid system for layout
   - Sticky summary sidebar on large screens (lg:col-span-1)

### 5. **Updated Pages**
   - **HomePage** - Uses `useMovies()` hook
   - **MovieDetailsPage** - Uses `useMovies()` hook
   - **TheaterShowsPage** - Uses `useShowsByMovie()` hook with date parameter
   - **SeatSelectionPage** - Complete redesign:
     - Real API data from `useShowSeats()`
     - SVG-based seat visualization
     - Grid layout: 2 columns for seats (lg), 1 column for summary
     - Responsive summary sidebar with:
       - Selected seats display
       - Price breakdown (seat price + convenience fee)
       - Total price calculation
       - Booking button

### 6. **Features**
   - ✅ Theater → Shows → Seats flow
   - ✅ SVG seat icons like BookMyShow
   - ✅ TanStack Query caching on every page
   - ✅ Fully responsive design (mobile, tablet, desktop)
   - ✅ Real-time seat selection with visual feedback
   - ✅ Seat status indicators (available/booked/locked)
   - ✅ Price calculation
   - ✅ Booking summary sidebar

## File Structure

```
src/
├── App.jsx (Updated with QueryClientProvider)
├── api/
│   ├── axios.js
│   ├── movieApi.js
│   └── bookingApi.js
├── components/
│   ├── MovieCard.jsx
│   ├── SvgSeat.jsx (NEW)
│   └── SvgSeatingLayout.jsx (NEW)
├── pages/
│   ├── HomePage.jsx (Updated)
│   ├── MovieDetailsPage.jsx (Updated)
│   ├── TheaterShowsPage.jsx (Updated)
│   └── SeatSelectionPage.jsx (Completely redesigned)
└── utils/
    ├── useMovies.js (NEW)
    ├── useShowsByMovie.js (NEW)
    ├── useShowSeats.js (NEW)
    └── seatUtils.js (NEW)
```

## How to Use

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Flow:**
   - Click on a movie → Shows all theaters and their shows
   - Click "Select Seats" on a show → Interactive SVG seat layout
   - Select seats → Price updates automatically
   - Click "Proceed to Pay" → Books the seats

## Caching Benefits

- Movies list cached across entire app
- Shows for a date cached per movie
- Seats data cached per show
- Browser back button doesn't trigger new API calls
- Automatic refetch after stale time
- Garbage collection after timeout

## Responsive Breakpoints

- Mobile: `< 640px` (sm breakpoint)
- Tablet: `640px - 1024px` (lg breakpoint)
- Desktop: `> 1024px`

All components scale proportionally with appropriate font sizes and spacing.
