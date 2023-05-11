import * as core from "@actions/core";
import * as path from "path";
import {
  findPackageJsonPaths,
  installDependencies,
  readPackageJson,
} from "./utils";

const main = async (): Promise<void> => {
  try {
    const packages = core.getInput("packages");

    if (!packages) {
      core.setFailed("No packages provided...");
      return;
    }

    const packageNames = packages.split(",");
    const cwd = process.cwd();
    const jsonPaths = findPackageJsonPaths(cwd);

    for (const jsonPath of jsonPaths) {
      const packageJson = await readPackageJson(jsonPath);
      const packagePath = path.dirname(jsonPath);

      // Update dependencies
      if (packageJson.dependencies) {
        await installDependencies({
          packageNames,
          dependencies: packageJson.dependencies,
          packagePath,
          isDevDependency: false,
        });
      }

      // Update dev dependencies
      if (packageJson.devDependencies) {
        await installDependencies({
          packageNames,
          dependencies: packageJson.devDependencies,
          packagePath,
          isDevDependency: true,
        });
      }
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
};

main();
