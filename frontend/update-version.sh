#!/bin/bash

# Update version.json with current timestamp
echo "{
  \"version\": \"$(date +%s)\",
  \"deployedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}" > public/version.json

echo "Version updated to $(date +%s)"
