"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.determinePackageManager = exports.installPackage = exports.readPackageJson = exports.findPackageJsonPaths = exports.installDependencies = void 0;
const exec = __importStar(require("@actions/exec"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const installDependencies = async ({ packageNames, dependencies, packagePath, isDevDependency, }) => {
    for (const packageName of packageNames) {
        if (dependencies[packageName]) {
            await (0, exports.installPackage)({
                packagePath,
                packageName,
                isDevDependency,
            });
        }
    }
};
exports.installDependencies = installDependencies;
const findPackageJsonPaths = (dirPath) => {
    const packageJsonPaths = [];
    const directories = fs.readdirSync(dirPath);
    for (const dir of directories) {
        const filePath = path.join(dirPath, dir);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory() && dir !== "node_modules") {
            const subPackageJsonPaths = (0, exports.findPackageJsonPaths)(filePath);
            packageJsonPaths.push(...subPackageJsonPaths);
        }
        else if (stats.isFile() && dir === "package.json") {
            packageJsonPaths.push(filePath);
        }
    }
    return packageJsonPaths;
};
exports.findPackageJsonPaths = findPackageJsonPaths;
const readPackageJson = async (packageJsonPath) => {
    const fileContents = await fs.promises.readFile(packageJsonPath, "utf8");
    return JSON.parse(fileContents);
};
exports.readPackageJson = readPackageJson;
var PackageManager;
(function (PackageManager) {
    PackageManager["NPM"] = "npm";
    PackageManager["YARN"] = "yarn";
})(PackageManager || (PackageManager = {}));
const installPackage = async ({ packagePath, packageName, isDevDependency, }) => {
    const packageManager = (0, exports.determinePackageManager)(packagePath);
    const devDep = isDevDependency ? "-D" : "";
    if (packageManager === PackageManager.YARN) {
        await exec.exec("yarn", ["add", devDep, packageName], {
            cwd: packagePath,
        });
    }
    else if (packageManager === PackageManager.NPM) {
        await exec.exec("npm", ["install", devDep, packageName], {
            cwd: packagePath,
        });
    }
    else {
        throw new Error("Invalid package manager...");
    }
};
exports.installPackage = installPackage;
const determinePackageManager = (packagePath) => {
    const yarnLockPath = path.join(packagePath, "yarn.lock");
    const packageLockPath = path.join(packagePath, "package-lock.json");
    if (fs.existsSync(yarnLockPath)) {
        return PackageManager.YARN;
    }
    else if (fs.existsSync(packageLockPath)) {
        return PackageManager.NPM;
    }
    else {
        throw new Error("Unable to determine the package manager. Make sure either yarn.lock or package-lock.json exists in the package directory...");
    }
};
exports.determinePackageManager = determinePackageManager;
//# sourceMappingURL=utils.js.map