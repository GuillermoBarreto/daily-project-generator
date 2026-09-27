# daily-project-generator

A CLI tool that scaffolds a new starter project every day — a small daily-coding habit helper.

## What it does

- Generates a dated starter project (`project-YYYY-MM-DD`) under `daily-projects/`
- Skips generation if today's project already exists
- Warns on unknown CLI flags instead of failing silently

## Tech stack

- Node.js (ES modules, zero dependencies)
- Node's built-in test runner (`node --test`)

## Usage

```bash
node src/index.js --name my-idea --description "What I want to build"
node src/index.js --help
```

Options: `--output-dir`, `--name`, `--description`, `--date`, `--help`

## Tests

```bash
npm test
```
