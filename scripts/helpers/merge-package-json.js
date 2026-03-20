#!/usr/bin/env node

/**
 * Helper script to merge package.json files
 * Used by scaffold-app.sh to combine base and feature dependencies
 */

const fs = require("fs");
const path = require("path");

function deepMerge(target, source) {
  const output = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        if (
          target[key] &&
          typeof target[key] === "object" &&
          !Array.isArray(target[key])
        ) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else if (Array.isArray(source[key])) {
        if (Array.isArray(target[key])) {
          // Merge arrays by combining unique values
          output[key] = [...new Set([...target[key], ...source[key]])];
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    }
  }

  return output;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      "Usage: merge-package-json.js <target-package.json> <source-fragment-json-or-path>",
    );
    process.exit(1);
  }

  const targetPath = args[0];
  const sourceInput = args[1];

  // Read target package.json
  if (!fs.existsSync(targetPath)) {
    console.error(`Target file not found: ${targetPath}`);
    process.exit(1);
  }

  let targetJson;
  try {
    const targetContent = fs.readFileSync(targetPath, "utf8");
    targetJson = JSON.parse(targetContent);
  } catch (error) {
    console.error(`Failed to parse target package.json: ${error.message}`);
    process.exit(1);
  }

  // Parse source (can be a file path or inline JSON)
  let sourceJson;
  try {
    // First try to parse as JSON directly
    sourceJson = JSON.parse(sourceInput);
  } catch {
    // If not valid JSON, try to read as file
    if (fs.existsSync(sourceInput)) {
      try {
        const sourceContent = fs.readFileSync(sourceInput, "utf8");
        sourceJson = JSON.parse(sourceContent);
      } catch (error) {
        console.error(`Failed to parse source file: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.error("Source must be valid JSON or a valid file path");
      process.exit(1);
    }
  }

  // Merge the JSONs
  const mergedJson = deepMerge(targetJson, sourceJson);

  // Sort dependencies and devDependencies alphabetically
  if (mergedJson.dependencies) {
    mergedJson.dependencies = Object.keys(mergedJson.dependencies)
      .sort()
      .reduce((obj, key) => {
        obj[key] = mergedJson.dependencies[key];
        return obj;
      }, {});
  }

  if (mergedJson.devDependencies) {
    mergedJson.devDependencies = Object.keys(mergedJson.devDependencies)
      .sort()
      .reduce((obj, key) => {
        obj[key] = mergedJson.devDependencies[key];
        return obj;
      }, {});
  }

  // Write back to target file
  try {
    fs.writeFileSync(targetPath, JSON.stringify(mergedJson, null, 2) + "\n");
    console.log(`✓ Successfully merged package.json`);
  } catch (error) {
    console.error(`Failed to write merged package.json: ${error.message}`);
    process.exit(1);
  }
}

main();
