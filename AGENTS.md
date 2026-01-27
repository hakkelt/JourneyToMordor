# Agent Instructions

These instructions must be followed by all agents working on this project.

## Tooling

- **Use Bun**: Always use `bun` instead of `npm` or `yarn` for running scripts and installing packages.
  - Run scripts with `bun run <script>` (e.g., `bun run dev`, `bun run test`).
  - **Note**: Always use `bun run test` to execute the project's test suite. `bun test` invokes Bun's native runner, which is not used here and will fail.
  - Install dependencies with `bun install` or `bun add`.

## Testing Strategy

- **Requirement**: Every new feature **must** include accompanying unit tests and/or end-to-end (E2E) tests.
- **Verification Routine**: Upon completing a task, you must run the following verification steps:
  1.  **Unit Tests**: `bun run test:unit -- --run`
  2.  **E2E Tests**: `bun run test:e2e`
  3.  **Linter**: `bun run lint`

### Running Specific Tests

#### End-to-End Tests (Playwright)

**Standard approach** (uses Vite cache for faster rebuilds):

- To run all e2e tests: `bun run test:e2e`
- To run a specific test file: `bun run test:e2e e2e/unit-selection.test.ts`
- To run a specific test by title: `bun run test:e2e -g "should display distances in km"`

**Fast iterative testing** (for repeated test runs):

1. Terminal 1: `bun run test:e2e:server` (build once and keep server running)
2. Terminal 2: `bun run test:e2e` (runs tests instantly, reuses server)

See `docs/e2e-testing.md` for detailed performance optimization information.

#### Unit Tests (Vitest)

- To run a specific unit test file: `bun run test:unit src/lib/storage.spec.ts -- --run`
- To run Vitest in watch mode: `bun run test:unit`

## Code Quality & Architecture

- **File Size Limit**: Strive to keep source files under **500 lines**.
- **Refactoring**: If a source file exceeds 500 lines, you must examine options to refactor and break it apart into smaller, more focused components or utility modules.

## Security

- **Endpoints**: Ensure all endpoints are secure.
- **Dependencies**: Regular checks for vulnerable dependencies.
- **Secrets**: Never commit secrets or API keys to the repository.
- **Input Validation**: Validate all user inputs.

## Best Practices

### Svelte (Svelte 5)

- **Use Runes**: Prefer `$state`, `$derived`, and `$effect` for reactivity.
- **Component Modularity**: Keep components small and focused. Extract logic into helper functions or stores when possible.
- **Props**: Use `$props()` for clarity in Svelte 5.

### TypeScript

- **Strict Typing**: Avoid using `any`. Define interfaces and types for all data structures.
- **Explicit Returns**: Prefer explicit return types for functions to improve readability and catch errors.
- **Utility Types**: Use TypeScript utility types (e.g., `Partial`, `Omit`, `Pick`) to maintain DRY principles in definitions.

### Web Development

- **Semantic HTML**: Use proper HTML5 tags (`<main>`, `<header>`, `<article>`, etc.) for better accessibility and SEO.
- **Accessibility (A11y)**: Ensure interactive elements are keyboard-accessible and have proper ARIA attributes where needed.
- **Performance**: Optimize images and minimize heavy third-party scripts.

### Firebase

- **Security Rules**: Always consider Firestore Security Rules when implementing data access. Never rely solely on client-side logic.
- **Optimistic UI**: Implement optimistic updates for a better user experience, while handling potential sync failures gracefully.
- **Data Modeling**: Structure Firestore documents to minimize read costs and avoid deeply nested subcollections unless necessary.

* +## Project Structure
* +- `src/lib/storage.ts`: Core logic for data persistence and unit conversion.
  +- `src/lib/firebase.ts`: Firebase configuration and helpers.
  +- `src/routes`: SvelteKit routes.
  +- `e2e`: Playwright end-to-end tests.
*
