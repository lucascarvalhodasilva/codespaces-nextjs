const path = require('path')
const { spawn } = require('child_process')

const SEED_SCRIPTS = {
  trades: path.join(__dirname, 'seed-trades.js'),
  strategies: path.join(__dirname, 'seed-strategies.js')
}

const OPTION_TO_SEEDS = {
  trades: ['trades'],
  strategies: ['strategies'],
  all: Object.keys(SEED_SCRIPTS)
}

function normalizeArg(arg) {
  if (!arg) return null
  return arg.startsWith('--') ? arg.slice(2) : arg
}

function parseArgs(argv) {
  if (!argv.length) {
    return ['trades']
  }

  const selections = new Set()

  for (const arg of argv) {
    const normalized = normalizeArg(arg)
    const seeds = OPTION_TO_SEEDS[normalized]

    if (!seeds) {
      throw new Error(`Unknown seed option "${arg}". Use all, trades, or strategies.`)
    }

    if (normalized === 'all') {
      return [...OPTION_TO_SEEDS.all]
    }

    seeds.forEach((seed) => selections.add(seed))
  }

  return selections.size ? [...selections] : ['trades']
}

function runSeed(kind) {
  return new Promise((resolve, reject) => {
    const scriptPath = SEED_SCRIPTS[kind]

    if (!scriptPath) {
      return reject(new Error(`No seed script registered for "${kind}"`))
    }

    const child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit'
    })

    child.on('error', (err) => reject(err))
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Seed script "${kind}" exited with code ${code}`))
      }
      resolve()
    })
  })
}

async function main() {
  const seedsToRun = parseArgs(process.argv.slice(2))

  console.log(`\n🌱 Running seed(s): ${seedsToRun.join(', ')}`)

  for (const seed of seedsToRun) {
    await runSeed(seed)
  }

  console.log('\n✅ Seed run complete')
}

main().catch((err) => {
  console.error('\n❌ Seed run failed:', err.message)
  process.exit(1)
})
