export enum PackageManager {
  NPM = "npm",
  YARN = "yarn",
}

export interface InstallDependenciesParams {
  /* The names of the packages to install */
  packageNames: string[];
  /* The dependencies to check against */
  dependencies: Record<string, string>;
  /* The path to the package.json file */
  packagePath: string;
  /* Whether or not the packages are dev dependencies */
  isDevDependency: boolean;
}

export interface PackageJson {
  /* Package JSON dependencies property */
  dependencies?: Record<string, string>;
  /* Package JSON devDependencies property */
  devDependencies?: Record<string, string>;
}

export interface InstallPackageParams {
  /* The path to the package.json file */
  packagePath: string;
  /* The name of the package to install */
  packageName: string;
  /* Whether or not the package is a dev dependency */
  isDevDependency: boolean;
}
