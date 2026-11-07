import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data')
const file = path.join(dir, 'store.json')
const initial = { users: [], tasks: [], sessions: [] }
let queue = Promise.resolve()
export async function readStore() {
  await fs.mkdir(dir, { recursive: true })
  try { return JSON.parse(await fs.readFile(file, 'utf8')) }
  catch (e) { if (e.code !== 'ENOENT') throw e; await writeStore(initial); return structuredClone(initial) }
}
export function writeStore(data) {
  queue = queue.then(async () => {
    await fs.mkdir(dir, { recursive: true })
    const temp = `${file}.tmp`
    await fs.writeFile(temp, JSON.stringify(data, null, 2))
    await fs.rename(temp, file)
  })
  return queue
}
