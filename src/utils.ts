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
  const contents = fs.readdirSync(dirPath)

  for (const content of contents) {
    const filePath = path.join(dirPath, content)
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

export const parsePackageJson = async (
  packageJsonPath: string
): Promise<PackageJson> => {
  const packageJsonFile = await fs.promises.readFile(packageJsonPath, 'utf8')

  return JSON.parse(packageJsonFile) as PackageJson
}

export const installPackage = async ({
  packagePath,
  packageName,
  isDevDependency
}: InstallPackageParams): Promise<void> => {
  const packageManager = getPackageManager(packagePath)
  const isYarn = packageManager === PackageManager.YARN

  const command = isYarn ? 'yarn' : 'npm'
  const subCommand = isYarn ? 'add' : 'install'
  const args = isDevDependency ? [subCommand, '-D'] : [subCommand]

  await exec.exec(command, [...args, packageName], { cwd: packagePath })
}

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
