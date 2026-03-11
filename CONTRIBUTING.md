# Contributing to Rabbit Hole

Thank you for your interest in contributing! Please read this guide before opening a pull request.

## Getting Started

1. Fork the repository and clone your fork.
2. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Follow the [setup instructions](README.md#setup-instructions) to get the project running locally.

## Development Workflow

- Keep pull requests focused — one feature or fix per PR.
- Write or update tests for any logic you add or change.
- Run the full test suite before opening a PR:
  ```bash
  npm test
  ```
- Ensure the CI checks pass before requesting a review.

## Branch Naming

| Prefix | Use for |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | Tooling, CI, dependencies |
| `refactor/` | Code cleanup without behavior change |

## Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(scope): short description

Optional longer description.
```

Examples:

```
feat(epistemic): add speculation support type
fix(api): handle missing article ID in GET /articles/:id
docs(readme): improve setup instructions
```

## Code Style

- TypeScript is used across the monorepo — no `any` unless absolutely necessary.
- Format code with Prettier before committing.
- Follow the existing patterns in each package.

## Environment Variables

- Never commit `.env` files.
- Add new variables to `.env.example` with a blank value and a comment explaining the variable.

## Reporting Bugs

Open a GitHub Issue with:

- A clear title
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, Node version, Expo SDK version)

## Feature Requests

Open a GitHub Discussion or Issue tagged `enhancement`. Describe the motivation and the proposed approach.

## License

By contributing you agree that your contributions will be licensed under the [MIT License](LICENSE).
