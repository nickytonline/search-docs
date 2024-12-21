# Documentation Crawler

A TypeScript-based web crawler specifically designed for documentation websites. It extracts content and stores it in a Turso database for further processing.

## Features

- Crawls documentation websites systematically
- Extracts meaningful content from main content areas
- Handles fragment identifiers and section titles
- Stores crawled content in a Turso database
- Includes rate limiting to be respectful to servers
- Skips irrelevant content (like "Skip to Content" links)

## Prerequisites

- Node.js (v20 or higher recommended)
- npm
- A [Turso](https://turso.tech) database account

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables

4. Initialize the database:

```bash
npm run init-db
```

5. Run the crawler. This might take a while.

```bash
npm run crawl
```

6. At the same time, you can run the dev server to start searching the docs.

```bash
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

| Variable             | Description                                    | Required |
|---------------------|------------------------------------------------|----------|
| `DOCS_BASE_URL`     | The base URL of the website (e.g., https://some-site.com) | Yes |
| `TURSO_DATABASE_URL`| Your Turso database URL                        | Yes      |
| `TURSO_AUTH_TOKEN`  | Authentication token for Turso database access | Yes      |
