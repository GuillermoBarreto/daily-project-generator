import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

function resolveOutputDir(explicitOutputDir) {
  return explicitOutputDir || process.env.DAILY_PROJECT_OUTPUT_DIR || path.resolve(process.cwd(), 'daily-projects')
}

function parseCliArgs(argv) {
  const options = {}

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--output-dir') {
      options.outputDir = argv[index + 1]
      index += 1
    } else if (arg === '--name') {
      options.projectName = argv[index + 1]
      index += 1
    } else if (arg === '--description') {
      options.description = argv[index + 1]
      index += 1
    } else if (arg === '--date') {
      options.date = argv[index + 1]
      index += 1
    } else if (arg === '--help' || arg === '-h') {
      options.help = true
    }
  }

  return options
}

export async function generateDailyProject({
  outputDir = resolveOutputDir(),
  projectName = `project-${new Date().toISOString().slice(0, 10)}`,
  date = new Date().toISOString().slice(0, 10),
  description = 'A fresh starter project for today.'
} = {}) {
  const projectPath = path.join(outputDir, projectName)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  if (fs.existsSync(projectPath)) {
    return { projectPath, created: false, reason: 'already-exists' }
  }

  fs.mkdirSync(projectPath, { recursive: true })
  fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true })

  fs.writeFileSync(
    path.join(projectPath, 'README.md'),
    `# ${projectName}\n\nGenerated on ${date}.\n\n## Description\n\n${description}\n\n## Next steps\n\n- Implement your idea\n- Run the project\n- Commit the scaffold to git\n`
  )

  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify({
      name: projectName,
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        start: 'node src/index.js'
      }
    }, null, 2) + '\n'
  )

  fs.writeFileSync(
    path.join(projectPath, 'src/index.js'),
    `console.log('Hello from ${projectName}!')\n`
  )

  fs.writeFileSync(
    path.join(projectPath, '.gitignore'),
    'node_modules\n.DS_Store\n'
  )

  return { projectPath, created: true }
}

async function main() {
  const cliArgs = parseCliArgs(process.argv.slice(2))

  if (cliArgs.help) {
    console.log('Usage: node src/index.js [options]\n\nOptions:\n  --output-dir <path>  Directory where projects are created\n  --name <name>        Project folder name\n  --description <text> Short project description\n  --date <yyyy-mm-dd>  Date used in the generated README')
    return
  }

  const date = cliArgs.date || new Date().toISOString().slice(0, 10)
  const projectName = cliArgs.projectName || `project-${date}`
  const outputDir = resolveOutputDir(cliArgs.outputDir)
  const result = await generateDailyProject({ outputDir, projectName, date, description: cliArgs.description })

  if (!result.created) {
    console.log(`A project already exists for today: ${projectName}`)
    return
  }

  console.log(`Created daily starter project at ${result.projectPath}`)
}

const isDirectExecution = process.argv[1] && (import.meta.url === pathToFileURL(process.argv[1]).href)

if (isDirectExecution) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
