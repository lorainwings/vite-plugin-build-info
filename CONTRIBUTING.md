# Contributing Guide

Thank you for your interest in contributing to `@hhfe/vite-plugin-release-info`! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Run development mode: `pnpm dev`
4. Run tests: `pnpm test`

## Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. This ensures that our changelog is automatically generated based on commit messages.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples

```bash
# Feature
git commit -m "feat: add support for custom metadata fields"

# Bug fix
git commit -m "fix: resolve issue with git branch detection"

# Documentation
git commit -m "docs: update README with usage examples"

# Breaking change
git commit -m "feat!: change default injection position to head

BREAKING CHANGE: The default injection position has changed from body to head"
```

## Release Process

1. Make your changes and commit them using conventional commit format
2. Run tests: `pnpm test`
3. Build the project: `pnpm build`
4. Update version and generate changelog:
   - `pnpm bumpp:patch` - for bug fixes (0.0.1 → 0.0.2)
   - `pnpm bumpp:minor` - for new features (0.0.1 → 0.1.0)
   - `pnpm bumpp:major` - for breaking changes (0.0.1 → 1.0.0)

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the commit message convention
3. Add tests for new functionality
4. Ensure all tests pass: `pnpm test`
5. Update documentation if needed
6. Submit a pull request

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `pnpm lint` to check for issues
- Run `pnpm format` to format code

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Run `pnpm test:coverage` to check test coverage

## Questions?

If you have any questions about contributing, please open an issue or reach out to the maintainers.
