param(
  [string]$FilePath = ""
)

$ErrorActionPreference = 'SilentlyContinue'

# Ensure we're inside a Git repo
$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) { exit 0 }
Set-Location -LiteralPath $repoRoot

# Check for changes
$status = git status --porcelain
if (-not $status) { exit 0 }

# Stage all changes
git add -A | Out-Null

# Build a concise commit message
try {
  if ($FilePath) {
    $rel = Resolve-Path -LiteralPath $FilePath -ErrorAction SilentlyContinue
    if ($rel) {
      $rel = [IO.Path]::GetRelativePath($repoRoot, $rel.Path)
    } else {
      $rel = $FilePath
    }
  } else {
    $rel = "multiple-files"
  }
} catch { $rel = "multiple-files" }

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$msg = "chore(auto): auto-commit on save: $rel @ $timestamp"

# Commit (no push here; post-commit hook handles push)
git commit -m "$msg" | Out-Null

exit 0

