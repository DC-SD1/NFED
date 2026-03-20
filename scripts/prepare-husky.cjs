const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function isTruthyEnv(value) {
  if (value === undefined || value === null) return false;
  return value === "1" || value === "true" || value === "TRUE";
}

// Vercel (and most CI providers) check out the repo without a full `.git` directory.
// `husky` runs during `prepare` and can fail when git metadata/hooks can't be created.
const isCI =
  isTruthyEnv(process.env.CI) ||
  process.env.VERCEL !== undefined ||
  process.env.VERCEL_ENV !== undefined ||
  process.env.BUILD_ID !== undefined;

const gitDir = path.join(process.cwd(), ".git");
if (isCI || !fs.existsSync(gitDir)) {
  // Keep install/build working even when git hooks aren't available.
  console.log("[prepare-husky] Skipping husky (CI or missing .git).");
  process.exit(0);
}

try {
  execSync("husky", { stdio: "inherit" });
} catch (err) {
  // Don't fail the whole install in case husky can't run for any reason.
  console.log("[prepare-husky] husky failed, but continuing install.");
  process.exit(0);
}

