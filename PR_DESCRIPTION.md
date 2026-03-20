# Fix: Reset Form Fields When Switching Shipping Methods

## Summary
This PR fixes an issue where switching between shipping methods (Air, Land, Sea) in the personalised crops sourcing flow didn't properly reset dependent form fields, causing stale data to persist.

## Problem
When users selected a shipping method (e.g., "Air"), filled in incoterms and other details, then switched to a different shipping method (e.g., "Land"), the previously selected incoterms and other method-specific fields would remain visible/selected, leading to incorrect form state and potential data inconsistencies.

## Solution
- Added logic to automatically clear incoterms when the shipping method changes
- Implemented proper form state management using `useRef` to track previous shipping method
- Ensured form fields are reset when switching between different shipping methods

## Changes Made
- **`shipping-method-form.tsx`**: Added `useEffect` hook to detect shipping method changes and reset incoterms field
- **`shipping-options.json`**: Updated shipping options configuration
- **`form-select-input.tsx`**: Minor improvements to form select input component

## Testing
- ✅ Verified that switching from Air → Land clears incoterms
- ✅ Verified that switching from Land → Sea clears incoterms  
- ✅ Verified that switching from Sea → Air clears incoterms
- ✅ All existing tests pass

## Impact
- Users can now switch between shipping methods without stale data persisting
- Form state is properly managed and consistent
- Better user experience in the sourcing flow
