# API Versioning Strategy

## Current State (v1 - Implicit)
All endpoints currently use implicit v1 versioning:
- `/api/snfn/station-errors`
- `/api/packing/summary`
- `/api/spc/chart`
- etc.

## Future State (Explicit Versioning)

### URL-Based Versioning (Recommended)
```
/api/v1/snfn/station-errors
/api/v2/snfn/station-errors
/api/v1/spc/chart
```

### Why URL-Based vs Header-Based?
✅ **URL-Based Advantages:**
- Easy to test in browser
- Clear documentation
- Easier for frontend developers to understand
- Can cache different versions separately
- RESTful and intuitive

❌ **Header-Based Disadvantages:**
- Harder to test manually
- More complex client implementation
- Caching complications

---

## Migration Plan

### Phase 1: Add v1 Prefix to New Routes (Current Phase)
- **New routes** (like SPC) can optionally use `/api/v1/spc/chart`
- **Existing routes** stay as-is to avoid breaking changes
- No client-side changes required yet

### Phase 2: Dual Support (Future - When Breaking Changes Needed)
When you need to make breaking changes:
1. Keep old route: `/api/snfn/station-errors` (works as before)
2. Add new versioned route: `/api/v2/snfn/station-errors` (new behavior)
3. Optionally, old route becomes alias to `/api/v1/snfn/station-errors`

### Phase 3: Deprecation (Long-term)
1. Mark v1 routes as deprecated in documentation
2. Give clients 6-12 months to migrate
3. Eventually remove v1 support

---

## Implementation Example

### Option A: Separate Route Files Per Version
```
/routes/
  /v1/
    - snfnRoutes.js
    - spcRoutes.js
    - packingRoutes.js
  /v2/
    - snfnRoutes.js
    - spcRoutes.js
```

**server.js:**
```javascript
const snfnV1Router = require('./routes/v1/snfnRoutes');
app.use('/api/v1/snfn', snfnV1Router);

const snfnV2Router = require('./routes/v2/snfnRoutes');
app.use('/api/v2/snfn', snfnV2Router);
```

### Option B: Version Logic Inside Route Files (Simpler for now)
```javascript
// routes/snfnRoutes.js
router.get('/v1/station-errors', async (req, res) => {
    // Old implementation
});

router.get('/v2/station-errors', async (req, res) => {
    // New implementation with breaking changes
});
```

**server.js:**
```javascript
const snfnRouter = require('./routes/snfnRoutes');
app.use('/api/snfn', snfnRouter);  // Handles both v1 and v2 internally
```

---

## Recommended Approach for Fox App

### Immediate Action (No Breaking Changes)
Keep current structure but **add version prefix for new features**:

```javascript
// Current routes (unchanged - implicit v1)
app.use('/api/snfn', snfnRouter);
app.use('/api/packing', packingRouter);

// New SPC routes (explicit v1)
app.use('/api/v1/spc', spcRouter);  // OR keep it as /api/spc for consistency
```

### When Breaking Changes Are Needed
1. Create new route file or new route handler
2. Add v2 prefix
3. Keep v1 working
4. Update frontend gradually

**Example:**
```javascript
// Old route (stays for backwards compatibility)
router.get('/station-errors', async (req, res) => {
    // Original implementation
});

// New route with breaking changes
router.get('/v2/station-errors', async (req, res) => {
    // New implementation
    // Maybe different response format, new required params, etc.
});
```

---

## Version Change Policy

### What Requires a New Version?
**Breaking Changes (require new major version):**
- Removing or renaming fields in response
- Changing field data types
- Adding required parameters
- Changing authentication requirements
- Changing error response formats

**Non-Breaking Changes (can stay in same version):**
- Adding new optional parameters
- Adding new fields to response (append only)
- Adding new endpoints
- Bug fixes
- Performance improvements

### Version Lifecycle
- **v1**: Current production version
- **v2**: Introduce when needed with breaking changes
- **v1 Deprecated**: Announce deprecation, set end-of-life date
- **v1 Sunset**: Remove v1 support after migration period

---

## Documentation

### Changelog Example
```markdown
## v2 (2025-11-01)
### Breaking Changes
- `/api/v2/snfn/station-errors`: Changed `code_count` to `error_count`
- `/api/v2/snfn/station-errors`: Added required parameter `workstation`

### Additions
- New endpoint: `/api/v2/spc/chart` for control charts

## v1 (Current)
- All existing endpoints
- Deprecated: Will be sunset on 2026-05-01
```

---

## Testing Strategy

### Test Both Versions
```javascript
// test/spcRoutes.test.js
describe('SPC Routes', () => {
    describe('v1', () => {
        it('should return chart data', async () => {
            const response = await request(app)
                .get('/api/v1/spc/chart?startDate=2025-09-01&endDate=2025-10-01');
            expect(response.status).toBe(200);
        });
    });
    
    describe('v2', () => {
        it('should return chart data with new format', async () => {
            const response = await request(app)
                .get('/api/v2/spc/chart?startDate=2025-09-01&endDate=2025-10-01');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('metadata.version', 2);
        });
    });
});
```

---

## Frontend Integration

### Environment-Based API Version
```javascript
// frontend/src/config.js
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/${API_VERSION}`;

// Usage
export const fetchSPCChart = async (filters) => {
    const response = await fetch(`${API_BASE_URL}/spc/chart?${params}`);
    return response.json();
};
```

### Gradual Migration
```javascript
// frontend/src/api/spc.js

// Old way (still works)
export const fetchChartV1 = () => fetch('/api/spc/chart');

// New way (when you're ready)
export const fetchChartV2 = () => fetch('/api/v2/spc/chart');

// Unified (with feature flag)
export const fetchChart = () => {
    const useV2 = localStorage.getItem('api_version') === 'v2';
    return useV2 ? fetchChartV2() : fetchChartV1();
};
```

---

## Current Recommendation

For the SPC feature we just built:

### Keep it simple for now:
```javascript
// server.js
app.use('/api/spc', spcRouter);  // No version prefix yet
```

**Rationale:**
- It's a new feature (no breaking changes to worry about)
- Consistent with existing routes
- Can add versioning later when needed

### Future-proof the code:
- Document response formats clearly
- Use TypeScript or JSDoc for types
- Write tests to catch breaking changes
- Plan for v2 structure when needed

---

## When to Implement Versioning

Implement explicit versioning when:
1. You need to make a **breaking change** to an existing endpoint
2. You have external clients/apps depending on your API
3. You want to test new API behavior without affecting production
4. You're approaching a major release milestone

Until then, keep it simple! ✅

