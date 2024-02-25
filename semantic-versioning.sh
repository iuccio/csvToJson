#!/bin/bash

set -e

validate_is_master_branch(){
echo "Checking branch...";
RELEASE_BRANCH="master";
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD);
echo "current branch: $CURRENT_BRANCH"
if [ $RELEASE_BRANCH != $CURRENT_BRANCH ]; then
    echo "A new release version is only bumped on branch: $RELEASE_BRANCH.";
    echo "Exiting...";
    exit 0;
fi
}

npm_release(){
  RELEASE_COMMIT_MSG="new release [skip ci]"
  PATCH_MSG="[PATCH]";
  MAJOR_MSG="[MAJOR]";
  echo "Parsing git message...";
  COMMIT_MSG=$(git log -1 --pretty=format:"%s");
  echo "Last commit message: ${COMMIT_MSG}";
  if [[ $COMMIT_MSG == *"$PATCH_MSG"* ]]; then
      echo "Executing new PATCH release..."
      npm version patch --force -m "{$RELEASE_COMMIT_MSG";
  elif [[ $COMMIT_MSG == *"$MAJOR_MSG"* ]]; then
      echo "Executing new MAJOR release..."
      npm version major --force -m "${RELEASE_COMMIT_MSG}";
  else
    echo "Executing new MINOR release...";
    npm version minor --force -m "${RELEASE_COMMIT_MSG}";
  fi
  echo "Publish new version..."
  npm publish;
  echo "Publish git info...";
  git push --follow-tags
  echo "New version successfully published."
}

execute-new-release(){
    echo "Start Semantic Versioning release...";
    validate_is_master_branch;
    npm_release;
    echo "End Semantic Versioning release.";
}

execute-new-release;
