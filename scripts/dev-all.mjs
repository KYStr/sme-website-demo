import { spawn } from 'node:child_process'

const node = process.execPath
const children = []
let stopping = false

function prefix(name, stream) {
  let rest = ''
  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    rest += chunk
    const lines = rest.split(/\r?\n/)
    rest = lines.pop() ?? ''
    for (const line of lines) process.stdout.write(`[${name}] ${line}\n`)
  })
  stream.on('end', () => {
    if (rest) process.stdout.write(`[${name}] ${rest}\n`)
  })
}

function launch(name, args) {
  const child = spawn(node, args, { stdio: ['inherit', 'pipe', 'pipe'], windowsHide: true })
  prefix(name, child.stdout)
  prefix(name, child.stderr)
  child.on('exit', (code, signal) => {
    if (stopping) return
    process.stderr.write(`[${name}] 結束（${signal ?? code}）\n`)
    stop(code ?? 1)
  })
  children.push(child)
}

function stop(code) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (!child.killed) child.kill()
  }
  setTimeout(() => process.exit(code), 1000)
}

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))

launch('server', ['--disable-warning=ExperimentalWarning', '--env-file-if-exists=.env', 'server/index.ts'])
launch('web', ['node_modules/vite/bin/vite.js'])
