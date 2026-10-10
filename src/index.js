import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

function resolveOutputDir(explicitOutputDir) {
  return explicitOutputDir || process.env.DAILY_PROJECT_OUTPUT_DIR || path.resolve(process.cwd(), 'daily-projects')
}


function getPackageVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    return packageJson.version || 'unknown'
  } catch {
    return 'unknown'
  }
}

function parseCliArgs(argv) {
  const options = {}
  const valueFlags = {
    '--output-dir': 'outputDir',
    '--name': 'projectName',
    '--description': 'description',
    '--date': 'date',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg in valueFlags) {
      const value = argv[index + 1]
      if (value === undefined || value.startsWith('-')) {
        // A flag with no value (or followed by another flag) is a usage
        // error, not something to silently ignore: --output-dir on its own
        // used to fall back to the default dir without telling the user.
        throw new Error(`Missing value for "${arg}". Usage: ${arg} <value>`)
      }
      options[valueFlags[arg]] = value
      index += 1
    } else if (arg === '--help' || arg === '-h') {
      options.help = true
    } else if (arg === '--version' || arg === '-v') {
      options.version = true
    } else if (arg.startsWith('--')) {
      console.warn(`Warning: unknown option "${arg}" was ignored`)
    }
  }

  return options
}

function isValidCalendarDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
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
    `console.log(${JSON.stringify(`Hello from ${projectName}!`)})\n`
  )

  fs.writeFileSync(
    path.join(projectPath, '.gitignore'),
    'node_modules\n.DS_Store\n'
  )

  return { projectPath, created: true }
}

async function main() {
  let cliArgs
  try {
    cliArgs = parseCliArgs(process.argv.slice(2))
  } catch (error) {
    console.error(error.message)
    process.exit(2)
  }

  if (cliArgs.version) {
    console.log(`daily-project-generator v${getPackageVersion()}`)
    return
  }

  if (cliArgs.help) {
    console.log('Usage: node src/index.js [options]\n\nOptions:\n  --output-dir <path>  Directory where projects are created\n  --name <name>        Project folder name\n  --description <text> Short project description\n  --date <yyyy-mm-dd>  Date used in the generated README\n  --version            Print the CLI version and exit\n  --help, -h         Show this help message and exit')
    return
  }

  const date = cliArgs.date || new Date().toISOString().slice(0, 10)
  if (cliArgs.date && (!/^\d{4}-\d{2}-\d{2}$/.test(cliArgs.date) || !isValidCalendarDate(cliArgs.date))) {
    console.error(`Invalid --date "${cliArgs.date}". Expected a real calendar date in yyyy-mm-dd format.`)
    process.exit(2)
  }
  const projectName = cliArgs.projectName || `project-${date}`
  if (projectName !== path.basename(projectName) || projectName === '.' || projectName === '..') {
    console.error(`Invalid --name "${projectName}". The project name must be a single folder name without path separators.`)
    process.exit(2)
  }
  const outputDir = resolveOutputDir(cliArgs.outputDir)
  const result = await generateDailyProject({ outputDir, projectName, date, description: cliArgs.description })

  if (!result.created) {
    console.log(`A project named "${projectName}" already exists at ${result.projectPath}`)
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
