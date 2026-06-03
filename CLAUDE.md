# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture
For detailed technical architecture information, see [CLAUDE-architecture.md](./CLAUDE-architecture.md).
Imported to Claude memory via @CLAUDE-architecture.md

## Build/Test Commands
- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run lintfix` - Fix ESLint issues
- `npm run test` - Open Cypress test runner
- `npm run cypress` - Run all Cypress tests headlessly
- `npx cypress run --spec cypress/e2e/login.cy.js` - Run a single test

## Code Style Guidelines
- **Formatting**: Use Prettier with 160 chars line length, single quotes, no semi
- **Component Names**: Use multi-word names for components (except 'error')
- **TypeScript**: Use explicit types for function parameters (eg: `user: any`)
- **Error Handling**: Handle API errors with try/catch in async functions
- **State Management**: Use Pinia for state with proper typed stores
- **Testing**: Use data-cy attributes for test selectors
- **Imports**: Group imports by external packages first, then internal
- **Vue Components**: Follow Vue 3 Composition API patterns
- you need to do nvm use 22.21.0