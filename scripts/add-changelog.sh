#!/bin/bash
# ═══════════════════════════════════════════════════════
# Quick changelog entry adder for PathWise
#
# Usage:
#   ./scripts/add-changelog.sh "0.12.0" "feature" "Dark Mode & Themes" "Full dark mode support with system preference detection." "Dark mode toggle in Settings" "System preference auto-detection" "Smooth transition animations"
#
# Args:
#   $1 = version (e.g., "0.12.0")
#   $2 = tag (feature|improvement|fix|security)
#   $3 = title
#   $4 = description
#   $5+ = highlights (one per arg)
#
# After running: commit and push to deploy.
# ═══════════════════════════════════════════════════════

VERSION="$1"
TAG="$2"
TITLE="$3"
DESC="$4"
shift 4

DATE=$(date +"%B %-d, %Y")

# Build highlights array
HIGHLIGHTS=""
for h in "$@"; do
  HIGHLIGHTS="$HIGHLIGHTS      '$h',\n"
done

# Create the entry
ENTRY="  {\n    version: '$VERSION',\n    date: '$DATE',\n    title: '$TITLE',\n    tag: '$TAG',\n    description: '$DESC',\n    highlights: [\n$HIGHLIGHTS    ],\n  },"

# Insert after the CHANGELOG array opening
FILE="src/pages/WhatsNew/changelogData.ts"
sed -i "/^export const CHANGELOG: ChangelogEntry\[\] = \[$/a\\
$(echo -e "$ENTRY")" "$FILE"

echo "Added v$VERSION to changelog!"
echo "Don't forget to:"
echo "  1. git add $FILE"
echo "  2. git commit -m 'docs: add v$VERSION to What's New'"
echo "  3. git push"
