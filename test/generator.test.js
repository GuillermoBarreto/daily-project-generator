import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { generateDailyProject } from '../src/index.js'

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function readFile(projectDir, file) {
  return fs.readFileSync(path.join(projectDir, file), 'utf8')
}

test('generateDailyProject creates starter files', async (t) => {
  const tempRoot = createTempDir('daily-project-generator-')

  t.after(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  })

  const result = await generateDailyProject({
    outputDir: tempRoot,
    projectName: 'custom-project',
    date: '2026-07-15',
    description: 'Test project'
  })

  assert.equal(
    result.projectPath,
    path.join(tempRoot, 'custom-project')
  )

  assert.ok(
    fs.existsSync(path.join(result.projectPath, 'README.md')),
    'README.md should exist'
  )

  assert.ok(
    fs.existsSync(path.join(result.projectPath, 'package.json')),
    'package.json should exist'
  )

  assert.ok(
    fs.existsSync(path.join(result.projectPath, 'src/index.js')),
    'src/index.js should exist'
  )

  const readme = readFile(result.projectPath, 'README.md')
  assert.match(readme, /Test project/)
})

test('CLI entrypoint creates a daily project', (t) => {
  const tempRoot = createTempDir('daily-project-generator-cli-')

  t.after(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  })

  const testDate = '2026-07-15'

  const result = spawnSync(
    process.execPath,
    [
      'src/index.js',
      '--output-dir',
      tempRoot,
      '--date',
      testDate
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8'
    }
  )

  assert.equal(result.status, 0, result.stderr)

  const createdProject = path.join(tempRoot, `project-${testDate}`)

  assert.ok(
    fs.existsSync(path.join(createdProject, 'README.md')),
    'CLI should create README.md'
  )
})

test('CLI flags create a project with custom metadata', (t) => {
  const tempRoot = createTempDir('daily-project-generator-flags-')

  t.after(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  })

  const result = spawnSync(
    process.execPath,
    [
      'src/index.js',
      '--output-dir',
      tempRoot,
      '--name',
      'flag-project',
      '--description',
      'Custom CLI project',
      '--date',
      '2026-07-15'
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8'
    }
  )

  assert.equal(result.status, 0, result.stderr)

  const projectDir = path.join(tempRoot, 'flag-project')

  assert.ok(
    fs.existsSync(path.join(projectDir, 'README.md')),
    'README.md should exist'
  )

  assert.ok(
    fs.existsSync(path.join(projectDir, '.gitignore')),
    '.gitignore should exist'
  )

  const packageJson = JSON.parse(readFile(projectDir, 'package.json'))

  assert.equal(packageJson.name, 'flag-project')

  const readme = readFile(projectDir, 'README.md')

  assert.match(readme, /Custom CLI project/)
})