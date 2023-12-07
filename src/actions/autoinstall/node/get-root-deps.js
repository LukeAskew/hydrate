let { existsSync, readFileSync } = require('fs')
let { join } = require('path')

// Get package[-lock].json contents and map out root dependency versions
module.exports = function getRootDeps ({ inv }) {
  let root = inv._project.cwd
  let packageJson = join(root, 'package.json')
  let packageLock = join(root, 'package-lock.json')

  let package = existsSync(packageJson) && JSON.parse(readFileSync(packageJson)) || {}
  let deps = Object.assign(package.devDependencies || {}, package.dependencies || {})

  let lock = existsSync(packageLock) && JSON.parse(readFileSync(packageLock))
  let lockDepsRaw = lock.dependencies ?? lock.packages

  // Top level lockfile deps only; we aren't going to walk the tree
  if (lock && lockDepsRaw) {
    let lockDeps = {}
    Object.entries(lockDepsRaw).forEach(([ dep, data ]) => {
      if (!dep || !data.version || data.dev) return
      lockDeps[dep.replace(/^node_modules\//, '')] = data.version
    })
    // Locked deps win
    deps = Object.assign(deps, lockDeps)
  }

  return deps
}
