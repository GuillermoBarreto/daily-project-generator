import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { generateDailyProject } from '../src/index.js'

test('generateDailyProject creates starter files', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'daily-project-generator-'))
  const result = await generateDailyProject({
    outputDir: tempRoot,
    projectName: 'custom-project',
    date: '2026-07-15',
    description: 'Test project'
  })

  assert.equal(result.projectPath, path.join(tempRoot, 'custom-project'))
  assert.ok(fs.existsSync(path.join(result.projectPath, 'README.md')))
  assert.ok(fs.existsSync(path.join(result.projectPath, 'package.json')))
  assert.ok(fs.existsSync(path.join(result.projectPath, 'src/index.js')))

  const readme = fs.readFileSync(path.join(result.projectPath, 'README.md'), 'utf8')
  assert.match(readme, /Test project/)
})

test('CLI entrypoint creates a daily project', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'daily-project-generator-cli-'))
  const result = spawnSync(process.execPath, ['src/index.js'], {
    cwd: path.resolve(process.cwd()),
    env: {
      ...process.env,
      DAILY_PROJECT_OUTPUT_DIR: tempRoot
    },
    encoding: 'utf8'
  })

  assert.equal(result.status, 0, result.stderr)
  const createdProject = path.join(tempRoot, `project-${new Date().toISOString().slice(0, 10)}`)
  assert.ok(fs.existsSync(path.join(createdProject, 'README.md')))
})

test('CLI flags create a project with custom metadata', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'daily-project-generator-flags-'))
  const result = spawnSync(process.execPath, [
    'src/index.js',
    '--output-dir', tempRoot,
    '--name', 'flag-project',
    '--description', 'Custom CLI project',
    '--date', '2026-07-15'
  ], {
    cwd: path.resolve(process.cwd()),
    encoding: 'utf8'
  })

  assert.equal(result.status, 0, result.stderr)
  const projectDir = path.join(tempRoot, 'flag-project')
  assert.ok(fs.existsSync(path.join(projectDir, 'README.md')))
  assert.ok(fs.existsSync(path.join(projectDir, '.gitignore')))

  const packageJson = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'))
  assert.equal(packageJson.name, 'flag-project')

  const readme = fs.readFileSync(path.join(projectDir, 'README.md'), 'utf8')
  assert.match(readme, /Custom CLI project/)
})
