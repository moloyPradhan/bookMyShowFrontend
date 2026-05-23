# Architecture Overview

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      App.jsx                                 │
│         (Wrapped with QueryClientProvider)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Routes                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Home              → HomePage (useMovies)                ││
│  │ /movie/:id        → MovieDetailsPage (useMovies)        ││
│  │ /movie/:id/shows  → TheaterShowsPage (useShowsByMovie)  ││
│  │ /show/:id/seats   → SeatSelectionPage (useShowSeats)    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Query Cache Hierarchy

```
┌─────────────────────────────────┐
│     React Query Client          │
├─────────────────────────────────┤
│                                 │
│  Query Cache:                   │
│  ├─ ['movies']                  │
│  │  └─ staleTime: 5min          │
│  │     gcTime: 30min            │
│  │                              │
│  ├─ ['shows', movieId, date]    │
│  │  └─ staleTime: 5min          │
│  │     gcTime: 30min            │
│  │                              │
│  └─ ['seats', showId]           │
│     └─ staleTime: 2min          │
│        gcTime: 10min            │
└─────────────────────────────────┘
```

## Seat Selection Component Architecture

```
┌────────────────────────────────────────────┐
│    SeatSelectionPage (Container)           │
│  ┌──────────────────────────────────────────┤
│  │  State:                                  │
│  │  - selectedSeats: []                     │
│  │  - useShowSeats(showId) - fetches data   │
│  └──────────────────────────────────────────┤
│           │                                  │
│      ┌────┴────────────────────┐            │
│      ↓                         ↓            │
│  ┌────────────────────┐  ┌───────────────┐ │
│  │ SvgSeatingLayout   │  │ Summary Card  │ │
│  │ (2/3 width - lg)   │  │ (1/3 width)   │ │
│  ├────────────────────┤  ├───────────────┤ │
│  │ SVG (500px-800px)  │  │ Selected:     │ │
│  │ ┌──────────────────┤  │ A1, A2, A3    │ │
│  │ │ SCREEN           │  ├───────────────┤ │
│  │ │ ┌─ Row Labels    │  │ Price:        │ │
│  │ │A│O O O O O O O O │  │ ₹600          │ │
│  │ │B│O ● ● O O O O O │  ├───────────────┤ │
│  │ │C│O O O O O O O O │  │ Book Button   │ │
│  │ └──────────────────┤  │ (Sticky)      │ │
│  │ Legend:            │  └───────────────┘ │
│  │ ● = Selected       │                    │
│  │ O = Available      │                    │
│  │ ✗ = Booked        │                    │
│  └────────────────────┘                    │
└────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
Mobile                Tablet               Desktop
(<640px)             (640-1024px)         (>1024px)
┌──────────┐         ┌──────────────┐     ┌─────────────────────┐
│ Seats    │         │  Seats│ Sum  │     │    Seats      │ Sum │
│  (Full)  │         │ (2/3) │(1/3) │     │   (2/3)       │(1/3)│
└──────────┘         └──────────────┘     └─────────────────────┘
Stacked              Side by side         Side by side
24px seats           32px seats            40px seats
```

## SVG Seat Rendering

```
SVG Viewbox:
┌─────────────────────────────────────────────────┐
│                                                 │
│  • Screen (Header element)                      │
│  ┌─────────────────────────────────────────┐    │
│  │ 🎬 SCREEN                               │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  • Seat Grid (Organized by rows)                │
│                                                 │
│  A │ ╭─────────────────────────────╮           │
│    │ │ O  O  O  O  O  O  O  O  O  O│           │
│    │ ╰─────────────────────────────╯           │
│                                                 │
│  B │ ╭─────────────────────────────╮           │
│    │ │ O  ●  ●  O  O  O  O  O  O  O│           │
│    │ ╰─────────────────────────────╯           │
│                                                 │
│  C │ ╭─────────────────────────────╮           │
│    │ │ O  O  O  O  O  O  O  ✗  ✗  O│           │
│    │ ╰─────────────────────────────╯           │
│                                                 │
└─────────────────────────────────────────────────┘

Legend:
O = Available (green-500, clickable)
● = Selected (blue-500, with white indicator)
✗ = Booked (red-500, disabled, opacity-60)
⊗ = Locked (amber-500, disabled, opacity-60)
```

## Caching Strategy Flow

```
User Action → API Call?
    ↓
Check React Query Cache
    ├─ If valid (staleTime not exceeded)
    │  └─ Return cached data → Component renders
    │
    └─ If stale (staleTime exceeded)
       ├─ Return stale data immediately
       ├─ Fetch fresh data in background
       └─ Update component when new data arrives
```

## Selected Seats State Flow

```
render()
  ↓
useShowSeats(showId)  ← Fetch seats via React Query
  ↓
SvgSeatingLayout receives:
  - seats: all available seats
  - selectedSeats: user selections
  - onSeatSelect: callback
  - onSeatDeselect: callback
  ↓
SvgSeat component for each seat:
  - Renders based on status color
  - Checks if in selectedSeats array
  - Shows selection indicator if selected
  - On click → parent callback
  ↓
Parent updates selectedSeats state
  ↓
Price calculation: selectedSeats.length × 200
  ↓
Summary card updates with new total
```
