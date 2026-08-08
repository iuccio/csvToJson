
# Automatic Release Management Guide with Semantic-Release

This guide explains how to configure and use `semantic-release` to centrally and automatically manage versioning for a full-stack project containing a **Java/Spring Boot (Gradle)** backend and an **Angular (TypeScript)** frontend. It also covers how to pull **Jira** ticket information directly into the root `CHANGELOG.md`.

---

## 🛠️ Project Architecture

The project follows a **Mono-version (Single-version)** approach: all sub-modules share the exact same version number, orchestrated globally from the root of the repository.

```text
├── CHANGELOG.md <-- Created and updated in the global root
├── gradle.properties <-- Holds the centralized Gradle version
├── .releaserc.json <-- Global semantic-release configuration file
├── package.json <-- Node.js dependencies for the release pipeline
├── backend/ <-- Java Spring Boot sub-module
└── frontend/ <-- Angular sub-module (contains its own package.json)
```

---

## ⚙️ Configuration Files

### 1. `gradle.properties` (Root)
Initialize the version at the Gradle root level. The `backend/build.gradle` file will automatically inherit this value.
```properties
version=1.0.0
```

### 2. `package.json` (Root)
This file is required to install the release toolrunner and the specific Jira community plugin.
```json
{
  "name": "my-fullstack-app-root",
  "version": "1.0.0",
  "private": true,
  "devDependencies": {
    "semantic-release": "^24.0.0",
    "@semantic-release/changelog": "^6.0.0",
    "@semantic-release/exec": "^6.0.0",
    "@semantic-release/git": "^10.0.0",
    "@semantic-release/github": "^10.0.0",
    "@semantic-release/npm": "^12.0.0",
    "semantic-release-jira-notes": "^1.5.0"
  }
}
```

### 3. `.releaserc.json` (Root)
This file orchestrates the simultaneous updates of Gradle, Angular, and the Jira-enriched changelog generation.
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    [
      "semantic-release-jira-notes",
      {
        "jiraHost": "your-domain.atlassian.net",
        "ticketPrefixes": ["PROJ", "STORY"]
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/exec",
      {
        "verifyConditionsCmd": "chmod +x ./gradlew",
        "prepareCmd": "./gradlew -Pversion=\({nextRelease.version} && sed -i 's/version=.*/version=\){nextRelease.version}/' gradle.properties"
      }
    ],
    [
      "@semantic-release/npm",
      {
        "pkgRoot": "frontend",
        "npmPublish": false
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": [
          "gradle.properties",
          "frontend/package.json",
          "frontend/package-lock.json",
          "CHANGELOG.md"
        ],
        "message": "chore(release): \({nextRelease.version} [skip ci]\n\n\){nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}
```

---

## 📖 How-To-Do Guide

### Step 1: Writing Git Commits (The Standard)
Semantic-release parses Git commit messages to determine if it should trigger a Major, Minor, or Patch release. Always include your Jira ticket keys in the message body or header.

* **Patch Release (`1.0.0` -> `1.0.1`)** - For bug fixes:
    ```bash
    git commit -m "fix(backend): PROJ-123 resolved authentication token timeout"
    ```
* **Minor Release (`1.0.0` -> `1.1.0`)** - For new features:
    ```bash
    git commit -m "feat(frontend): PROJ-456 added real-time analytics dashboard"
    ```
* **Major Release (`1.0.0` -> `2.0.0`)** - For Breaking Changes:
    ```bash
    git commit -m "feat(api): PROJ-789 overhauled public user endpoints\n\nBREAKING CHANGE: the legacy v1 endpoint is now completely deprecated"
    ```

### Step 2: Configuring Environment Secrets
To allow semantic-release to write back to your Git repository and fetch data from Jira, you must expose the following environment variables in your CI/CD runner settings (e.g., GitHub Secrets):

1. `GITHUB_TOKEN`: The Git platform token (injected automatically inside GitHub Actions).
2. `JIRA_AUTH_USERNAME`: The email address associated with your Jira/Atlassian developer account (e.g., `developer@company.com`).
3. `JIRA_AUTH_PASSWORD`: A **Jira API Token** instead of your plain password. You can generate one at [Atlassian Security Accounts](https://atlassian.com).

### Step 3: Automating with CI/CD (GitHub Actions Example)
Create a `.github/workflows/release.yml` file to trigger the release workflow automatically every time code is merged into the `main` branch:

```yaml
name: Release Automation

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Release Dependencies
        run: npm install

      - name: Run Semantic Release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          JIRA_AUTH_USERNAME: \${{ secrets.JIRA_EMAIL }}
          JIRA_AUTH_PASSWORD: \${{ secrets.JIRA_API_TOKEN }}
```

---

## 🔄 The Release Workflow Lifecycle

When the pipeline runs successfully, the following automated steps occur:
1. **Analysis**: The tool extracts all commits made since the last Git tag.
2. **Jira Enrichment**: It scans the commit messages for ticket prefixes (e.g., `PROJ-123`), queries the Jira API, and retrieves the corresponding story summary/title.
3. **Changelog Updates**: It prepends the newly generated release notes directly to the top of the root `CHANGELOG.md`.
4. **Codebase Version Syncing**:
   * Runs the `sed` execution utility to swap the version string inside the root `gradle.properties` file.
   * Enters the `frontend/` directory and updates the Angular `package.json` version metadata.
5. **Git Commit & Tagging**: It commits the modified files back to the branch (including a `[skip ci]` flag to avoid infinitely looping the pipeline triggers) and tags the commit with a global tag (e.g., `v1.1.0`).

