import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import {
  type InstallDependenciesParams,
  type InstallPackageParams,
  PackageManager,
  ExecCommandParams,
  PackageJson
} from './types'

export const installDependencies = async ({
  packageNames,
  dependencies,
  packagePath,
  isDevDependency
}: InstallDependenciesParams): Promise<void> => {
  for (const packageName of packageNames) {
    if (dependencies[packageName]) {
      await installPackage({
        packagePath,
        packageName,
        isDevDependency
      })

      core.info(`Installed ${packageName}...`)
    }
  }
}

export const getPackageJsonPaths = (dirPath: string): string[] => {
  const packageJsonPaths: string[] = []
  const directories = fs.readdirSync(dirPath)

  for (const dir of directories) {
    const filePath = path.join(dirPath, dir)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory() && dir !== 'node_modules') {
      const subPackageJsonPaths = getPackageJsonPaths(filePath)
      packageJsonPaths.push(...subPackageJsonPaths)
    } else if (stats.isFile() && dir === 'package.json') {
      packageJsonPaths.push(filePath)
    }
  }

  return packageJsonPaths
}

export const parsePackageJson = async (
  packageJsonPath: string
): Promise<PackageJson> => {
  const fileContents = await fs.promises.readFile(packageJsonPath, 'utf8')
  return JSON.parse(fileContents) as PackageJson
}

export const installPackage = async ({
  packagePath,
  packageName,
  isDevDependency
}: InstallPackageParams): Promise<void> => {
  const packageManager = getPackageManager(packagePath)

  if (packageManager === PackageManager.YARN) {
    await execCommand({
      command: 'yarn',
      args: ['add', packageName],
      packagePath,
      isDevDependency
    })
  } else if (packageManager === PackageManager.NPM) {
    await execCommand({
      command: 'npm',
      args: ['install', packageName],
      packagePath,
      isDevDependency
    })
  } else {
    throw new Error('Invalid package manager...')
  }

  core.debug(`Installed ${packageName}...`)
}

const execCommand = async ({
  command,
  args,
  packagePath,
  isDevDependency
}: ExecCommandParams): Promise<void> => {
  if (!isDevDependency) {
    await exec.exec(command, args, { cwd: packagePath })
  } else {
    await exec.exec(command, [...args, '-D'], { cwd: packagePath })
  }
}

export const getPackageManager = (packagePath: string): PackageManager => {
  const yarnLock = path.join(packagePath, 'yarn.lock')
  const packageLock = path.join(packagePath, 'package-lock.json')

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
