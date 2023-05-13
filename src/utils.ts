import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import {
  type InstallDependenciesParams,
  type InstallPackageParams,
  PackageManager,
  PackageJson
} from './types'

/**
 * Function to install the given packages as dependencies or dev dependencies
 */

export const installDependencies = async ({
  packageNames,
  dependencies,
  packagePath,
  isDevDependency
}: InstallDependenciesParams): Promise<void> => {
  for (const packageName of packageNames) {
    const name = packageName.replace(/^([^@]*@[^@]*)@(.*)$/, '$1')
    if (dependencies[name]) {
      core.info(
        `Found ${packageName} as a ${
          isDevDependency ? 'dev' : ''
        } dependency attempting to install...`
      )

      const response = await installPackage({
        packagePath,
        packageName,
        isDevDependency
      })

      if (response !== 0) {
        core.warning(`Failed to install ${packageName}`)

        continue
      }

      core.info(`Installed ${packageName}...`)
    }
  }
}

/**
 * Function to recursively find all package.json files in the given directory
 * and its subdirectories. We default to find all package.json files in the
 * current working directory
 */

export const getPackageJsonPaths = (dir = process.cwd()): string[] => {
  const packageJsonPaths: string[] = []
  const contents = fs.readdirSync(dir)

  for (const content of contents) {
    const filePath = path.join(dir, content)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory() && content !== 'node_modules') {
      const subPackageJsonPaths = getPackageJsonPaths(filePath)
      packageJsonPaths.push(...subPackageJsonPaths)
    } else if (stats.isFile() && content === 'package.json') {
      packageJsonPaths.push(filePath)
    }
  }

  return packageJsonPaths
}

/**
 * Function to parse the package.json file. Specifically,
 * we are interested in the dependencies and devDependencies properties
 */

export const parsePackageJson = async (
  packageJsonPath: string
): Promise<PackageJson> => {
  const packageJsonFile = await fs.promises.readFile(packageJsonPath, 'utf8')

  return JSON.parse(packageJsonFile) as PackageJson
}

/**
 * Function to install the package as a dependency or dev dependency
 * in the given package directory
 */

export const installPackage = async ({
  packagePath,
  packageName,
  isDevDependency
}: InstallPackageParams): Promise<number> => {
  const packageManager = getPackageManager(packagePath)
  const isYarn = packageManager === PackageManager.YARN

  const command = isYarn ? 'yarn' : 'npm'
  const subCommand = isYarn ? 'add' : 'install'
  const args = isDevDependency ? [subCommand, '-D'] : [subCommand]

  return exec.exec(command, [...args, packageName], { cwd: packagePath })
}

/**
 * Function to determine the package manager used in the package directory
 */

export const getPackageManager = (packageJsonPath: string): PackageManager => {
  const yarnLock = path.join(packageJsonPath, 'yarn.lock')
  const packageLock = path.join(packageJsonPath, 'package-lock.json')

  if (fs.existsSync(yarnLock)) {
    return PackageManager.YARN
  } else if (fs.existsSync(packageLock)) {
    return PackageManager.NPM
  } else {
    throw new Error(
      'Unable to determine the package manager. Make sure either yarn.lock or package-lock.json exists in the package directory...'
    )
  }
}

/**
 * Function to split the given input and append the tag to each package name
 */

export const splitAndAppendTag = (input: string, tag: string): string[] => {
  return input.split(',').map(packageName => {
    return `${packageName}@${tag}`
  })
}
