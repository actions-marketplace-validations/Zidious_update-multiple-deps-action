import * as core from '@actions/core'
import * as path from 'path'
import {
  getPackageJsonPaths,
  installDependencies,
  parsePackageJson,
  splitAndAppendTag
} from './utils'

const main = async (): Promise<void> => {
  try {
    const latest = core.getInput('latest')
    const next = core.getInput('next')

    if (!latest || !next) {
      throw new Error('You must provide a value for latest or next inputs...')
    }

    const packageNames = [
      ...splitAndAppendTag(latest, 'latest'),
      ...splitAndAppendTag(next, 'next')
    ]
    core.info(`Found packages: ${packageNames}...`)

    const jsonPaths = getPackageJsonPaths()
    core.info(`Found package.json paths: ${jsonPaths}...`)

    for (const jsonPath of jsonPaths) {
      const packageJson = await parsePackageJson(jsonPath)
      const packagePath = path.dirname(jsonPath)

      if (packageJson.dependencies) {
        await installDependencies({
          packageNames,
          dependencies: packageJson.dependencies,
          packagePath,
          isDevDependency: false
        })
      }

      if (packageJson.devDependencies) {
        await installDependencies({
          packageNames,
          dependencies: packageJson.devDependencies,
          packagePath,
          isDevDependency: true
        })
      }
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

main()
