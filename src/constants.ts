import { CommandFlag, PullPandaConfig } from "./types/index.js";

export const defaultPullPandaConfig: PullPandaConfig = {
  // turn this off when globally enabled
  enabled: true,
  reviews: {
    level: CommandFlag.FullReviewEnabled
  }
}

export const PULLPANDA_CONFIG_FILE = "pullpanda.yml";

export const botMentions = ["@pullpandaai", "@pullpanda"];

export const appName = "pullpanda-ai[bot]"

// regex patterns to ignore
export const ignoreFiles = [
  "package-lock.json",
  "yarn.lock",
  "npm-shrinkwrap.json",
  "node_modules/",
  "\.git/",
  "dist/",
  "build/",
  "min.js",
  "min.css",
  "\.map",
  "\.log",
  "\.tmp",
  "\.bak",
  "\.swp",
  "\.swo",
  "DS_Store",
  "Thumbs.db",
  "desktop.ini",
  "Pipfile.lock",
  "requirements.txt",
  "poetry.lock",
  "Gemfile.lock",
  "Cargo.lock",
  "go.sum",
  "pom.xml",
  "target/",
  "mix.lock",
  "\.png",
  "\.jpg",
  "\.jpeg",
  "\.gif",
  "\.ico",
  "\.svg",
  "\.woff",
  "\.woff2",
  "\.ttf",
  "\.eot",
  "\.mp4",
  "\.webm",
  "\.ogg",
  "\.mp3",
  "\.wav",
  "\.pdf",
  "\.exe",
  "\.zip",
  "\.dll",
  "tar.gz",
  "\.gz",
  "\.out",
  "\.class",
  "\.jar",
  "\.war",
  "\.apk",
  "\.bundle.js",
  "\.bundle.css",
  "\.pyc",
  "\.pyo",
  "\.dSYM",
  "\.obj",
  "\.gitignore",
  "\.gitattributes",
  "\.gitlab-ci.yml",
  "\.circleci/config.yml",
  "\.travis.yml",
  "\.vscode/",
  "\.idea/",
  "\.iml",
  "README.md",
  "LICENSE.md",
  "CHANGELOG.md",
  "swagger.yaml",
  "map",
];
