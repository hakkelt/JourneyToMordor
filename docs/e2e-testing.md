# E2E Testing Performance Optimization

This document explains how to run e2e tests faster by utilizing caching and server reuse.

## Problem

The e2e tests were timing out because the build process (especially image processing with `@sveltejs/enhanced-img`) takes a long time. Each test run was rebuilding everything from scratch.

## Solution

We've implemented several optimizations:

### 1. Vite Build Cache

The `vite.config.ts` now includes:

- **Rollup cache**: Caches build artifacts between builds
- **Vite cache directory**: Stores processed dependencies and transformations in `node_modules/.vite`

This means subsequent builds will be much faster as Vite reuses cached processed images and other assets.

### 2. Server Reuse

The `playwright.config.ts` is configured to reuse an existing server when running locally:

- `reuseExistingServer: !process.env.CI` - Reuses server locally, but always rebuilds in CI

### Running E2E Tests

```bash
bun run test:e2e
```

- First run: Builds everything (~3-5 minutes)
- Subsequent runs: Uses Vite cache (~1-2 minutes)
- Playwright will build and start server automatically

**Running specific tests:**

- To run a specific test file: `bun run test:e2e e2e/unit-selection.test.ts`
- To run a specific test by title: `bun run test:e2e -g "should display distances in km"`

## Performance Comparison

| Method              | First Run | Subsequent Runs |
| ------------------- | --------- | --------------- |
| Before optimization | ~3-5 min  | ~3-5 min        |
| With Vite cache     | ~3-5 min  | ~1-2 min        |

## Cache Location

- Vite cache: `node_modules/.vite/` (gitignored via `node_modules`)
- Build output: `build/` (gitignored)

## Clearing Cache

If you need to clear the cache:

```bash
rm -rf node_modules/.vite build .svelte-kit
```

## CI/CD

In CI environments (when `CI=true`), the server is never reused to ensure clean builds.
