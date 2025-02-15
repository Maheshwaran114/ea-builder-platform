# Contributing to EA Builder Platform

## Branching Strategy

We use a Git Flow–inspired branching model to ensure a clean and efficient workflow. Below are the guidelines:

### Main Branches
- **`main` (or `master`):**
  - Contains production-ready, stable code.
  - Only thoroughly tested and reviewed code should be merged here.
- **`develop`:**
  - Used for integrating new features and improvements.
  - All feature branches are merged here after testing.

### Supporting Branches
- **Feature Branches:**
  - Branch off from `develop` to work on new features.
  - Naming convention: `feature/<feature-name>`
  - Example: `feature/drag-and-drop-ui`
- **Bugfix Branches:**
  - Branch off from `develop` to fix bugs.
  - Naming convention: `bugfix/<issue-description>`
  - Example: `bugfix/login-error`
- **Release Branches (Optional):**
  - Used when preparing for a new release.
  - Naming convention: `release/<version-number>`
  - Example: `release/v0.1`
- **Hotfix Branches:**
  - Branch off from `main` for critical fixes in production.
  - Naming convention: `hotfix/<issue-description>`
  - Example: `hotfix/security-patch`

## Workflow

1. **Creating a Feature:**
   - Checkout the `develop` branch:
     ```
     git checkout develop
     ```
   - Create a new feature branch:
     ```
     git checkout -b feature/<feature-name>
     ```
   - Work on your feature and commit your changes:
     ```
     git add .
     git commit -m "Describe your feature"
     ```
   - Push your branch:
     ```
     git push origin feature/<feature-name>
     ```
   - Open a Pull Request to merge into `develop`.

2. **Handling Hotfixes:**
   - Checkout the `main` branch:
     ```
     git checkout main
     ```
   - Create a hotfix branch:
     ```
     git checkout -b hotfix/<issue-description>
     ```
   - Commit the fixes:
     ```
     git add .
     git commit -m "Fix critical issue"
     ```
   - Push the branch:
     ```
     git push origin hotfix/<issue-description>
     ```
   - Open a Pull Request to merge into `main`, and after merging, merge the changes back into `develop`.

## Commit Message Guidelines

- Use clear, concise commit messages.
- Include a brief description of the changes made.
- For example: `Implement drag-and-drop for EA builder` or `Fix login bug`.

Thank you for contributing to the EA Builder Platform!
