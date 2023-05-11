import * as exec from "@actions/exec";
import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import {
  type InstallDependenciesParams,
  type InstallPackageParams,
  PackageManager,
} from "./types";

export const installDependencies = async ({
  packageNames,
  dependencies,
  packagePath,
  isDevDependency,
}: InstallDependenciesParams): Promise<void> => {
  for (const packageName of packageNames) {
    if (dependencies[packageName]) {
      await installPackage({
        packagePath,
        packageName,
        isDevDependency,
      });
    }
  }
};

export const findPackageJsonPaths = (dirPath: string): string[] => {
  const packageJsonPaths: string[] = [];
  const directories = fs.readdirSync(dirPath);

  for (const dir of directories) {
    const filePath = path.join(dirPath, dir);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory() && dir !== "node_modules") {
      const subPackageJsonPaths = findPackageJsonPaths(filePath);
      packageJsonPaths.push(...subPackageJsonPaths);
    } else if (stats.isFile() && dir === "package.json") {
      packageJsonPaths.push(filePath);
    }
  }

  return packageJsonPaths;
};

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export const readPackageJson = async (
  packageJsonPath: string
): Promise<PackageJson> => {
  const fileContents = await fs.promises.readFile(packageJsonPath, "utf8");
  return JSON.parse(fileContents) as PackageJson;
};

export const installPackage = async ({
  packagePath,
  packageName,
  isDevDependency,
}: InstallPackageParams): Promise<void> => {
  const packageManager = determinePackageManager(packagePath);
  const devDep = isDevDependency ? "-D" : "";

  if (packageManager === PackageManager.YARN) {
    await exec.exec("yarn", ["add", devDep, packageName], {
      cwd: packagePath,
    });
  } else if (packageManager === PackageManager.NPM) {
    await exec.exec("npm", ["install", devDep, packageName], {
      cwd: packagePath,
    });
  } else {
    throw new Error("Invalid package manager...");
  }

  core.debug(`Installed ${packageName}...`);
};

export const determinePackageManager = (
  packagePath: string
): PackageManager => {
  const yarnLockPath = path.join(packagePath, "yarn.lock");
  const packageLockPath = path.join(packagePath, "package-lock.json");

  if (fs.existsSync(yarnLockPath)) {
    return PackageManager.YARN;
  } else if (fs.existsSync(packageLockPath)) {
    return PackageManager.NPM;
  } else {
    throw new Error(
      "Unable to determine the package manager. Make sure either yarn.lock or package-lock.json exists in the package directory..."
    );
  }
};
