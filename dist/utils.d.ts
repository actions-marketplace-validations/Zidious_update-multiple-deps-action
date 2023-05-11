interface InstallDependenciesParams {
    packageNames: string[];
    dependencies: Record<string, string>;
    packagePath: string;
    isDevDependency: boolean;
}
export declare const installDependencies: ({ packageNames, dependencies, packagePath, isDevDependency, }: InstallDependenciesParams) => Promise<void>;
export declare const findPackageJsonPaths: (dirPath: string) => string[];
interface PackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}
export declare const readPackageJson: (packageJsonPath: string) => Promise<PackageJson>;
declare enum PackageManager {
    NPM = "npm",
    YARN = "yarn"
}
interface InstallPackageParams {
    packagePath: string;
    packageName: string;
    isDevDependency: boolean;
}
export declare const installPackage: ({ packagePath, packageName, isDevDependency, }: InstallPackageParams) => Promise<void>;
export declare const determinePackageManager: (packagePath: string) => PackageManager;
export {};
