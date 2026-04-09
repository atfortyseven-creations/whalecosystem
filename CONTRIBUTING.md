# Contributing to Whale Alert Network

Thank you for your interest in contributing! We are building the most respected, sovereign, privacy-first on-chain intelligence platform in Web3.

## Ground Rules

- **Privacy First**: Any new feature must respect the Zero-Knowledge and Sovereign Vault architecture. We do not track users.
- **Performance**: The frontend terminal is optimized for 240Hz rendering. Heavy logic should run in the background (Whale Worker or Sovereign Vault), not on the UI thread.
- **Quality Requirements**: "Perfect and flawless code quality." We use TypeScript. Strict mode is mandated. 

## Pull Request Guidelines

1. **Branch Naming**: 
   - `feat/feature-name`
   - `fix/issue-description`
   - `docs/what-changed`
2. **Conventional Commits**: We strictly enforce Conventional Commits.
   - `feat:` for new features
   - `fix:` for bug fixes
   - `chore:` for maintenance
   - `docs:` for documentation updates
3. **Tests**: If adding new worker heuristics or contract logic, you must include unit tests. Our goal is 100% coverage.

## Running Locally for Development

Please refer to the `QUICKSTART.md` for standard running instructions. If you modify the Prisma schema, remember to generate the client:
```bash
npx prisma generate
```

## How to Report Issues

Use the templates in `.github/ISSUE_TEMPLATE` to report bugs or request features. Be as detailed as possible, especially regarding environment and hardware constraints.
