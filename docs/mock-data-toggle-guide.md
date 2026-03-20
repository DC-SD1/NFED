# Mock Data Toggle Guide

## Overview

The mock data toggle system allows developers and QA teams to easily switch between real API data and mock data during development and testing, without requiring environment variables or server restarts.

**Important**: Mock data is ONLY used when explicitly enabled via the toggle. When disabled, the app will always attempt to use real API data, even if the API is not yet integrated. This ensures a clear separation between mock and real data modes.

## Architecture

### Components

1. **Mock Data File** (`src/lib/constants/mock_data.ts`)
   - Centralized location for all mock data
   - Named exports for each data type (e.g., `MOCK_BUYERS`, `MOCK_GROWERS`)
   - Single source of truth

2. **Toggle Component** (`src/components/dev/mock-data-toggle.tsx`)
   - Simple prop-based component
   - Floating UI toggle (bottom-right corner)
   - Badge indicator for active state
   - Development-only (hidden in production)

3. **Integration** (e.g., `buyer-content.tsx`)
   - Uses simple `useState` for toggle state
   - Only uses mock data when explicitly enabled
   - Shows badge and helpful messages when mock mode is active

## Usage

### For Developers

1. Open the page in development mode
2. Look for the "Enable Mock Data" button in the bottom-right corner
3. Click to enable/disable mock mode
4. Toggle state resets on page reload

### For QA Teams

1. Navigate to the buyer listing page
2. **If API is not ready**: A helpful tooltip appears in the bottom-right corner
3. Click the "Enable Mock Data" button
4. Verify the amber badge (🧪 Mock Data Mode) appears in the header
5. Test features with mock data
6. Click the amber badge to disable and return to API mode

### Behavior

- **Mock Mode ON**: Always uses mock data, ignoring API responses
- **Mock Mode OFF**: Always attempts to use API data
  - If API is not ready or fails: Shows appropriate empty state
  - If API returns empty data: Shows standard empty state
  - Filters and search still work on whatever data is available
- **Toggle State**: Resets on page reload (not persisted)

## Adding Mock Data to New Features

To add mock data support to a new feature:

### Step 1: Add Mock Data to Centralized File
```typescript
// src/lib/constants/mock_data.ts
export const MOCK_BUYERS: Buyer[] = [...];

// Add new mock data export
export const MOCK_GROWERS: Grower[] = [
  {
    id: "1",
    name: "John Doe",
    // ... other fields
  },
  // ... more mock records
];
```

### Step 2: Integrate in Component
```typescript
import { MOCK_GROWERS } from "@/lib/constants/mock_data";
import { MockDataToggle } from "@/components/dev/mock-data-toggle";

export default function GrowerContent() {
  const [useMockData, setUseMockData] = useState(false);

  // Filter mock data if needed (search, filters, etc.)
  const filteredMockData = useMemo(() => {
    if (!useMockData) return [];
    // Apply filters to MOCK_GROWERS
    return MOCK_GROWERS.filter(/* your filter logic */);
  }, [useMockData, /* filter dependencies */]);

  const growers = useMockData
    ? filteredMockData
    : (apiResponse?.data?.data as Grower[]) || [];

  const metadata = useMockData
    ? {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: filteredMockData.length,
      }
    : apiResponse?.data?.pageData || {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: 0,
      };

  return (
    <div>
      {/* Show badge in header when mock mode is active */}
      {useMockData && (
        <MockDataToggle
          enabled={useMockData}
          onToggle={() => setUseMockData(!useMockData)}
          showBadgeOnly
        />
      )}
      
      {/* Your component JSX */}
      
      {/* Floating toggle button */}
      <MockDataToggle
        enabled={useMockData}
        onToggle={() => setUseMockData(!useMockData)}
      />
      
      {/* Pass useMockData to table for proper empty state handling */}
      <GrowerTable
        data={growers}
        useMockData={useMockData}
        // ... other props
      />
    </div>
  );
}
```

## Benefits

### ✅ Simple and Lightweight
- No environment variables needed
- No localStorage complexity
- Simple `useState` hook
- Works immediately

### ✅ Runtime Switching
- Toggle on/off with one click
- Instant feedback
- Clean state management

### ✅ Developer-Friendly
- Clear visual indicators
- Development-only (auto-hidden in production)
- Centralized mock data location
- Easy to understand and maintain

### ✅ QA-Friendly
- Easy to test UI without API dependencies
- Consistent test data
- No technical setup required

## Technical Details

### State Management
- Uses simple `useState(false)` hook
- State is component-scoped
- Resets on page reload (not persisted)
- No side effects or external dependencies

### Component Props
```typescript
interface MockDataToggleProps {
  enabled: boolean;      // Current mock data state
  onToggle: () => void;  // Callback to toggle state
  showBadgeOnly?: boolean; // Show only badge (for header)
}
```

### Production Safety
- Toggle button only renders in `NODE_ENV === "development"`
- No impact on production builds
- Zero overhead when not in development mode

## Troubleshooting

### Toggle Button Not Visible
- Ensure you're in development mode (`NODE_ENV=development`)
- Check browser console for errors
- Verify component is imported correctly

### Mock Data Not Loading
1. Verify mock data is exported from `src/lib/constants/mock_data.ts`
2. Check import statement in your component
3. Ensure `useMockData` state is properly set
4. Check console for errors

### Toggle Not Working
- Verify `onToggle` callback is properly connected to state setter
- Check that `enabled` prop is correctly passed
- Ensure no conflicting state management

## Best Practices

1. **Centralize all mock data** - Add to `src/lib/constants/mock_data.ts`
2. **Use named exports** - Clear, discoverable exports (e.g., `MOCK_BUYERS`)
3. **Match production structure** - Ensure mock data matches API response types
4. **Include edge cases** - Empty states, long strings, special characters
5. **Keep mock data updated** - Sync with API schema changes
6. **Document mock scenarios** - Add comments for notable test cases
7. **Test both modes** - Verify features work with API and mock data
8. **Simple state management** - Use `useState` for toggle state



## Future Enhancements

Potential improvements for consideration:
- Multiple mock data presets (empty, full, edge cases)
- Mock data generation from TypeScript types
- Network delay simulation
- Mock data validation against types


## 📝 Quick Checklist
For each new page you want to add:
[ ] Add mock data export to mock_data.ts
[ ] Import MOCK_DATA and MockDataToggle
[ ] Add useState(false) for toggle
[ ] Add filtering logic for mock data
[ ] Update data source to check useMockData
[ ] Add MockDataToggle components (badge + floating button)
[ ] Pass useMockData prop to the component
