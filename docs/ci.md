# Continuous Integration

CI in HydroMonitor Lab means validating every relevant change automatically before it is trusted.

It runs on pushes and pull requests targeting `main`.

```text
push / PR
↓
quality
↓
build + Jest
↓
e2e
↓
Cypress
↓
pass/fail
```

## What It Verifies

The `quality` job installs dependencies with `npm ci`, builds the TypeScript/Vite app, and runs Jest unit tests.

The `e2e` job runs after `quality`. It installs dependencies with `npm ci`, starts Vite and the local Express mock API through `npm run test:e2e`, waits for the frontend, and then runs Cypress.

## Why npm ci

`npm ci` uses `package-lock.json` to create a reproducible installation. It is stricter than `npm install`, which is better for CI because the workflow should test the exact dependency tree committed to Git.

## Why Tests Are In Git

Jest and Cypress tests are part of the source code. Keeping them in Git makes CI repeatable for every developer, every push, and every pull request.

Generated Cypress screenshots and videos are ignored because they are test output, not source.

## If A Test Fails

If build, Jest, or Cypress fails, the workflow fails. CI should block confidence in that change until the error is fixed.

HydroMonitor Lab currently implements CI only. It does not deploy automatically.
