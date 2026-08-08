
# Guida al Rilascio Automatico con Semantic-Release
Questa guida spiega come configurare e utilizzare `semantic-release` per gestire in modo centralizzato e automatico il versionamento del progetto, che include un backend **Java/Spring Boot (Gradle)** e un frontend **Angular (TypeScript)**, integrando le informazioni dei ticket **Jira** direttamente nel `CHANGELOG.md`.

---

## 🛠️ Architettura del Progetto

Il progetto utilizza un approccio **Mono-version (Single-version)**: tutti i moduli condividono lo stesso numero di versione, gestito globalmente dalla root del repository.

```text
├── CHANGELOG.md                    <-- Creato e aggiornato nella root globale
├── gradle.properties               <-- Contiene la versione centralizzata di Gradle
├── .releaserc.json                 <-- Configurazione globale di semantic-release
├── package.json                    <-- Dipendenze Node.js per la pipeline di release
├── backend/                        <-- Sotto-modulo Java Spring Boot
└── frontend/                       <-- Sotto-modulo Angular (contiene il suo package.json)
```

---

## ⚙️ File di Configurazione

### 1. `gradle.properties` (Root)
Inizializza la versione nella root di Gradle. Il file `backend/build.gradle` erediterà automaticamente questo valore.
```properties
version=1.0.0
```

### 2. `package.json` (Root)
File necessario per installare lo strumento di release e il plugin per l'integrazione con Jira.
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
Questo file orchestra l'aggiornamento simultaneo di Gradle, Angular e l'arricchimento del Changelog tramite Jira.
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    [
      "semantic-release-jira-notes",
      {
        "jiraHost": "il-tuo-dominio.atlassian.net",
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

## 📖 How-To-Do Guide (Guida Operativa)

### Fase 1: Come scrivere i Commit (Standard)
Semantic-release si basa sulla struttura dei messaggi Git per capire se creare una versione Major, Minor o Patch. Includi sempre il codice del ticket Jira.

*   **Patch Release (`1.0.0` -> `1.0.1`)** - Per correzioni di bug:
    ```bash
    git commit -m "fix(backend): PROJ-123 risolto problema di autenticazione ai servizi"
    ```
*   **Minor Release (`1.0.0` -> `1.1.0`)** - Per nuove funzionalità:
    ```bash
    git commit -m "feat(frontend): PROJ-456 aggiunto nuovo pannello di controllo"
    ```
*   **Major Release (`1.0.0` -> `2.0.0`)** - Per modifiche importanti (Breaking Changes):
    ```bash
    git commit -m "feat(api): PROJ-789 rifattorizzazione endpoint pubblici\n\nBREAKING CHANGE: il vecchio endpoint v1 è deprecato"
    ```

### Fase 2: Configurazione dei Segreti in Ambiente CI/CD
Per consentire a semantic-release di scrivere sul tuo repository e leggere da Jira, devi configurare le seguenti variabili d'ambiente (es. in GitHub Secrets o GitLab Variables):

1.  `GITHUB_TOKEN` o `GL_TOKEN`: Il token della tua piattaforma Git (gestito automaticamente da GitHub Actions).
2.  `JIRA_AUTH_USERNAME`: L'indirizzo email del tuo account Jira (es. `developer@azienda.com`).
3.  `JIRA_AUTH_PASSWORD`: Un **API Token** di Jira, generabile su [Atlassian Security](https://atlassian.com).

### Fase 3: Esecuzione nella Pipeline (Esempio GitHub Actions)
Crea un file `.github/workflows/release.yml` per automatizzare il processo ad ogni merge sul ramo `main`:

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
      - name: Checkout codice
        uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Installa dipendenze di release
        run: npm install

      - name: Esegui Semantic Release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          JIRA_AUTH_USERNAME: \${{ secrets.JIRA_EMAIL }}
          JIRA_AUTH_PASSWORD: \${{ secrets.JIRA_API_TOKEN }}
```

---

## 🔄 Cosa succede durante il rilascio?
1. **Analisi**: Lo strumento analizza i nuovi commit dal precedente tag Git.
2. **Arricchimento Jira**: Trova i codici dei ticket (es. `PROJ-123`), contatta l'API di Jira e recupera il titolo della storia.
3. **Changelog**: Scrive il nuovo blocco di note in testa al file `CHANGELOG.md` della root.
4. **Aggiornamento Codice**:
   * Esegue lo script `sed` modificando la versione in `gradle.properties`.
   * Entra nella cartella `frontend/` e aggiorna il file `package.json` di Angular.
5. **Git Commit & Tag**: Crea un commit di push automatico con i file modificati (usando la dicitura `[skip ci]` per evitare loop infiniti della pipeline) e genera un tag Git globale (es. `v1.1.0`).

