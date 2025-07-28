#!/bin/bash

# Script to view E2E test results from GitHub Actions
# Usage: ./scripts/view-e2e-results.sh [run-id]

set -e

if [ "$#" -eq 0 ]; then
    echo "📋 Recent workflow runs:"
    gh run list --limit 5
    echo ""
    echo "💡 Usage: $0 <run-id>"
    echo "💡 Example: $0 16258760991"
    exit 1
fi

RUN_ID=$1

echo "🔍 Fetching workflow details for run $RUN_ID..."
gh run view $RUN_ID

echo ""
echo "📊 Downloading E2E test artifacts..."

# Clean up previous downloads
rm -rf playwright-report/ test-results/ coverage-reports/

# Download artifacts
ARTIFACTS=$(gh run view $RUN_ID --json artifacts --jq '.artifacts[].name')

for artifact in $ARTIFACTS; do
    if [[ $artifact == *"playwright-report"* ]]; then
        echo "📥 Downloading: $artifact"
        gh run download $RUN_ID -n "$artifact"
        
        if [ -d "playwright-report" ]; then
            echo "🎬 Starting local server for Playwright report..."
            echo "🌐 Opening: http://localhost:8080"
            echo "🔄 Press Ctrl+C to stop server"
            python3 -m http.server 8080 --directory playwright-report
        fi
        break
    fi
done

if [ ! -d "playwright-report" ]; then
    echo "❌ No Playwright report found for this run"
    echo "Available artifacts:"
    echo "$ARTIFACTS"
fi