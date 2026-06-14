# Code Snippets Reference

Quick copy-paste reference for common customizations and tasks.

## 🎨 Customization Snippets

### Change Seat Price Per Ticket

**File:** `src/pages/SeatSelectionPage.jsx`

```javascript
// Current (₹200 per seat)
const SEAT_PRICE = 200;

const totalPrice = useMemo(() => {
  return selectedSeats.reduce((sum) => sum + SEAT_PRICE, 0);
}, [selectedSeats]);

// Change SEAT_PRICE to your desired amount
```

### Change Cache Duration

**File:** `src/utils/useMovies.js`

```javascript
// Current: 5 minutes stale, 30 minutes garbage collection
export const useMovies = () => {
  return useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await getMovies();
      return response.data.items || [];
    },
    staleTime: 1000 * 60 * 5,   // ← Change this (in milliseconds)
    gcTime: 1000 * 60 * 30,      // ← Change this (in milliseconds)
  });
};

// 1 min: 1000 * 60 * 1
// 5 min: 1000 * 60 * 5
// 10 min: 1000 * 60 * 10
// 30 min: 1000 * 60 * 30
// 1 hour: 1000 * 60 * 60
```

### Change Seat Colors

**File:** `src/utils/seatUtils.js`

```javascript
export const getSeatStatusColor = (status) => {
  switch (status) {
    case 'available':
      return '#10b981'; // ← Green, change hex code
    case 'booked':
      return '#ef4444'; // ← Red
    case 'locked':
      return '#f59e0b'; // ← Orange
    default:
      return '#6b7280'; // ← Gray
  }
};

// Common hex colors:
// Green:  #10b981
// Blue:   #3b82f6
// Red:    #ef4444
// Orange: #f59e0b
// Purple: #a855f7
// Pink:   #ec4899
```

### Change Responsive Seat Sizes

**File:** `src/utils/seatUtils.js`

```javascript
export const getResponsiveDimensions = (screenWidth) => {
  if (screenWidth < 640) {
    // Mobile
    return {
      seatSize: 24,      // ← Change seat size in px
      seatGap: 6,        // ← Gap between seats
      rowGap: 8,         // ← Gap between rows
      padding: 16,       // ← SVG padding
      fontSize: 10,      // ← Seat number font size
    };
  } else if (screenWidth < 1024) {
    // Tablet
    return {
      seatSize: 32,
      seatGap: 8,
      rowGap: 10,
      padding: 24,
      fontSize: 12,
    };
  } else {
    // Desktop
    return {
      seatSize: 40,
      seatGap: 10,
      rowGap: 12,
      padding: 32,
      fontSize: 14,
    };
  }
};
```

## 🔄 API Integration Snippets

### Add Token Authentication

**File:** `src/api/axios.js`

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

### Lock Seats After Selection

**File:** `src/pages/SeatSelectionPage.jsx`

```javascript
import { lockSeats } from "../api/bookingApi";

const handleBooking = async () => {
  if (selectedSeats.length === 0) {
    alert("Please select at least one seat");
    return;
  }

  try {
    const seatIds = selectedSeats.map((s) => s.id);
    
    // Call lock seats API
    const response = await lockSeats({
      show_id: showId,
      seat_ids: seatIds,
      lock_duration: 600, // 10 minutes in seconds
    });

    if (response.success) {
      const seatLabels = selectedSeats
        .map((s) => s.seat_label)
        .sort()
        .join(", ");
      alert(
        `Seats locked: ${seatLabels}\nTotal: ₹${totalPrice}\nProceed to payment...`
      );
      // Navigate to payment page
      navigate('/payment', { 
        state: { selectedSeats, showId, totalPrice } 
      });
    }
  } catch (error) {
    alert("Error locking seats: " + error.message);
  }
};
```

## 🎯 Component Snippets

### Add Seat Locking Timer

**Create:** `src/components/SeatLockTimer.jsx`

```javascript
import { useEffect, useState } from 'react';

const SeatLockTimer = ({ initialSeconds = 600 }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft < 60;
  const isExpired = timeLeft === 0;

  return (
    <div
      className={`p-3 rounded text-center font-semibold ${
        isExpired
          ? 'bg-red-600 text-white'
          : isWarning
          ? 'bg-orange-500 text-white'
          : 'bg-green-500 text-white'
      }`}
    >
      {isExpired
        ? '⏰ Lock Expired - Select seats again'
        : `⏱️ Seats locked for ${minutes}:${seconds.toString().padStart(2, '0')}`}
    </div>
  );
};

export default SeatLockTimer;
```

### Add Loading Skeleton

**Create:** `src/components/SeatSkeletonLoader.jsx`

```javascript
const SeatSkeletonLoader = () => {
  return (
    <div className="bg-zinc-800 rounded-lg p-6 animate-pulse">
      <div className="space-y-4">
        {/* Screen skeleton */}
        <div className="h-8 bg-zinc-700 rounded-full w-32 mx-auto"></div>

        {/* Seats skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 justify-center">
              {[...Array(10)].map((_, seatIdx) => (
                <div
                  key={seatIdx}
                  className="w-8 h-8 bg-zinc-600 rounded"
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatSkeletonLoader;
```

## 📊 Query Management Snippets

### Manual Cache Update After Booking

**File:** `src/pages/SeatSelectionPage.jsx`

```javascript
import { useQueryClient } from '@tanstack/react-query';

const SeatSelectionPage = () => {
  const queryClient = useQueryClient();
  const { data: seats } = useShowSeats(showId);

  const handleBooking = async () => {
    // ... booking logic ...

    // Invalidate seats cache to trigger refetch
    await queryClient.invalidateQueries({ 
      queryKey: ['seats', showId] 
    });

    // Or manually update cache
    queryClient.setQueryData(
      ['seats', showId],
      (oldData) =>
        oldData?.map((seat) =>
          selectedSeats.find((s) => s.id === seat.id)
            ? { ...seat, status: 'booked' }
            : seat
        )
    );
  };
};
```

### Prefetch Data for Better Performance

**File:** `src/pages/TheaterShowsPage.jsx`

```javascript
import { useQueryClient } from '@tanstack/react-query';
import { getShowSeats } from '../api/movieApi';

const TheaterShowsPage = () => {
  const queryClient = useQueryClient();

  const handleShowHover = (showId) => {
    // Prefetch seats data when hovering over a show
    queryClient.prefetchQuery({
      queryKey: ['seats', showId],
      queryFn: () => getShowSeats(showId),
    });
  };

  return (
    <button
      onMouseEnter={() => handleShowHover(show.show_id)}
      onClick={() => navigate(`/show/${show.show_id}/seats`)}
    >
      Select Seats
    </button>
  );
};
```

## 🧪 Testing Snippets

### Mock API for Testing

**Create:** `src/__mocks__/handlers.js` (with MSW)

```javascript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/movies', () => {
    return HttpResponse.json({
      success: true,
      statusCode: 200,
      data: {
        items: [
          {
            id: '1',
            title: 'Test Movie',
            poster_url: 'https://via.placeholder.com/200x300',
            banner_url: 'https://via.placeholder.com/1200x400',
          },
        ],
      },
    });
  }),

  http.get('*/api/shows/:showId/seats', () => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    
    rows.forEach((row) => {
      for (let i = 1; i <= 10; i++) {
        seats.push({
          id: `${row}${i}`,
          seat_row: row,
          seat_number: i.toString(),
          seat_label: `${row}${i}`,
          status: 'available',
          locked_by: null,
        });
      }
    });

    return HttpResponse.json({
      success: true,
      statusCode: 200,
      data: seats,
    });
  }),
];
```

## 🚀 Deployment Snippets

### Environment Variables

**Create:** `.env` file

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SEAT_PRICE=200
VITE_LOCK_DURATION=600
VITE_QUERY_STALE_TIME=300000
VITE_QUERY_GC_TIME=1800000
```

**Update:** `src/api/axios.js`

```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    // ... rest of config
});
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to hosting (example with Vercel)
vercel deploy --prod
```

---

**Last Updated:** 2026-05-23  
**Use Cases:** Customization, integration, testing
