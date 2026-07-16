import fs from 'fs'
import path from 'path'

const projectsDir = path.resolve(process.cwd(), 'daily-projects')
const today = new Date().toISOString().slice(0, 10)
const projectName = `project-${today}`
const projectPath = path.join(projectsDir, projectName)

if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir)
}

if (fs.existsSync(projectPath)) {
  console.log(`A project already exists for today: ${projectName}`)
  process.exit(0)
}

fs.mkdirSync(projectPath)
fs.writeFileSync(
  path.join(projectPath, 'README.md'),
  `# ${projectName}\n\nThis is a daily starter project scaffold generated on ${today}.\n\n## Description\n\nCreate a small project, experiment, or prototype as part of a daily coding habit.\n\n## Next steps\n\n- Add implementation files\n- Run the project\n- Commit the scaffold to git\`
)

fs.writeFileSync(
  path.join(projectPath, 'index.js'),
  `console.log('Hello from ${projectName}!')\n`
)

console.log(`Created daily starter project at ${projectPath}`)
