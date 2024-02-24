#!/bin/bash
echo "Start Semantic Versioning release...";
echo "Checking branch...";
RELEASE_BRANCH="master";
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD);
if [ $RELEASE_BRANCH != $CURRENT_BRANCH ]; then
    echo "A new release version is only bumped on branch: $RELEASE_BRANCH.";
    echo "Exiting...";
    exit 0;
fi
PATCH_MSG="[PATCH]";
MAJOR_MSG="[MAJOR]";
echo "Parsing git message...";
COMMIT_MSG=$(git log -1 --pretty=format:"%s");
echo "Last commit message: ${COMMIT_MSG}";
if [[ $COMMIT_MSG == *"$PATCH_MSG"* ]]; then
    echo "Executing new PATCH release..."
    npm run version-patch;
elif [[ $COMMIT_MSG == *"$MAJOR_MSG"* ]]; then
    echo "Executing new MAJOR release..."
    npm run version-major;
else
  echo "Executing new MINOR release...";
  npm run version-minor;
fi
echo "End Semantic Versioning release.";