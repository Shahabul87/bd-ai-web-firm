// Registers @testing-library/jest-dom's matcher types (toBeInTheDocument,
// toHaveClass, toHaveAttribute, …) with tsc. jest.setup.js already imports the
// matchers at RUNTIME, but it is plain JS and so never reaches the TypeScript
// program — without this file `npm run type-check` fails on every jest-dom
// matcher while `npm test` passes.
import '@testing-library/jest-dom';
