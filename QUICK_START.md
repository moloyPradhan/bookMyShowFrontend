# Quick Start Guide - BookMyShow Frontend

## Installation & Setup

### 1. Install Dependencies
```bash
cd d:\react\bookMyShowFrontend
npm install
```

This will install all dependencies including the newly added `@tanstack/react-query`.

### 2. Start Development Server
```bash
npm run dev
```

The app will start at `http://localhost:5173` (or similar port shown in terminal).

## Features Implemented

### ✅ Theater Flow
```
Home (Browse Movies)
  ↓
Movie Details
  ↓
Theater & Shows (Browse Available Shows)
  ↓
Seat Selection (Interactive SVG Layout)
  ↓
Booking Confirmation
```

### ✅ SVG Seat Visualization
- **Dynamic SVG rendering** of theater seats organized by rows
- **Color-coded status indicators:**
  - 🟢 Green: Available seats (clickable)
  - 🔵 Blue: Your selected seats (with indicator dot)
  - 🔴 Red: Already booked seats (disabled)
  - 🟠 Orange: Temporarily locked seats (disabled)
- **Responsive scaling:**
  - Mobile: 24px seats
  - Tablet: 32px seats
  - Desktop: 40px seats

### ✅ TanStack Query Caching
- **Movies page:** Data cached for 5 minutes
- **Shows page:** Data cached per movie + date for 5 minutes
- **Seats page:** Data cached per show for 2 minutes (updates frequently)
- Automatic background refetching when stale
- Smooth UX - shows cached data while fetching updates

### ✅ Responsive Design
- **Mobile (< 640px):**
  - Stacked layout (seats full width)
  - Touch-friendly seat sizing
  - Bottom-positioned booking summary
  
- **Tablet (640px - 1024px):**
  - Two-column layout
  - Seats take 2/3 width, summary 1/3
  
- **Desktop (> 1024px):**
  - Same layout as tablet
  - Sticky summary sidebar
  - Larger seats with more breathing room

## File Locations

### New Files Created

**Hooks (React Query integrations):**
- `src/utils/useMovies.js`
- `src/utils/useShowsByMovie.js`
- `src/utils/useShowSeats.js`

**Components:**
- `src/components/SvgSeat.jsx` - Individual seat SVG element
- `src/components/SvgSeatingLayout.jsx` - Full seating layout SVG

**Utilities:**
- `src/utils/seatUtils.js` - Seat organization & styling functions

### Updated Files

- `src/App.jsx` - Added QueryClientProvider
- `src/pages/HomePage.jsx` - Uses useMovies hook
- `src/pages/MovieDetailsPage.jsx` - Uses useMovies hook
- `src/pages/TheaterShowsPage.jsx` - Uses useShowsByMovie hook
- `src/pages/SeatSelectionPage.jsx` - Complete redesign with SVG

## Usage Examples

### Example 1: Browse Movies
1. App loads home page
2. Movies list is fetched and cached
3. Clicking a movie navigates to details page
4. Movies are already cached - instant load

### Example 2: Select Seats
1. Navigate to seat selection page
2. Seats are fetched for the show
3. Click available seats to select/deselect
4. Price updates in real-time in the sidebar
5. Summary shows selected seats and total cost
6. Click "Proceed to Pay" to book

### Example 3: Go Back & Return
1. Select some seats
2. Click back button
3. Navigate forward again to same show
4. Seats data is still cached - instant load
5. Your selection is reset (new page session)

## API Integration Points

The app expects the following API endpoints:

```javascript
GET /api/movies                           // Get all movies
GET /api/movies/:movieId/shows            // Get shows for movie (optional date param)
GET /api/shows/:showId/seats              // Get seats for show
POST /api/booking/lock                    // Lock selected seats
POST /api/booking/unlock                  // Unlock seats
```

Base URL: `http://localhost:8080/api` (from `src/api/axios.js`)

## Customization

### Change Seat Price
Edit `SeatSelectionPage.jsx`, line with seat calculation:
```javascript
const totalPrice = useMemo(() => {
  return selectedSeats.reduce((sum) => sum + 200, 0); // Change 200 to desired price
}, [selectedSeats]);
```

### Change Cache Times
Edit the custom hooks:
```javascript
// In src/utils/useMovies.js
staleTime: 1000 * 60 * 5,   // 5 minutes - change this
gcTime: 1000 * 60 * 30,      // 30 minutes - change this
```

### Change Responsive Breakpoints
Edit `src/utils/seatUtils.js` in `getResponsiveDimensions()` function.

### Customize Seat Colors
Edit `src/utils/seatUtils.js` in `getSeatStatusColor()` function, or edit individual color classes in component files.

## Debugging

### Check React Query Cache
The app uses React Query DevTools. To add it:
```bash
npm install @tanstack/react-query-devtools
```

Then add to `App.jsx`:
```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In App component, after QueryClientProvider:
<ReactQueryDevtools initialIsOpen={false} />
```

### Check Browser Console
- Open DevTools (F12)
- Go to Network tab to see API calls
- Go to Console to see any errors

## Common Issues

### Issue: Seats not loading
- Check browser console for errors
- Verify backend API is running at `http://localhost:8080`
- Ensure show ID is valid

### Issue: Seats not responsive
- Clear browser cache (Ctrl+Shift+Delete)
- Resize browser window to test different breakpoints
- Check if Tailwind CSS is properly imported

### Issue: Selection not working
- Ensure seat status is "available"
- Check if seat is already booked (status: "booked")
- Check console for JavaScript errors

## Performance Tips

1. **Browser Cache:** React Query automatically caches data - no extra setup needed
2. **Code Splitting:** App uses React Router lazy loading - pages load on demand
3. **SVG Optimization:** SVG is rendered efficiently even with 100+ seats
4. **Image Lazy Loading:** Consider adding lazy loading for movie posters

## Next Steps

1. ✅ Connect backend API endpoints
2. ✅ Test with real show data
3. ✅ Implement payment gateway
4. ✅ Add seat locking (30 sec countdown)
5. ✅ Add user authentication
6. ✅ Add booking history

---

**Need Help?** Check the IMPLEMENTATION_SUMMARY.md and ARCHITECTURE.md files for more details.
