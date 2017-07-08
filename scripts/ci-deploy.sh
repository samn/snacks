set -e
set -u
set -o xtrace

# The Travis CI firebase deploy provider wasn't working (it kept failing when installing
# firebase-tools dependencies), so we'll do it manually with the script provider.

yarn global add firebase-tools
firebase deploy --non-interactive --token "$FIREBASE_CI_TOKEN" --project "$FIREBASE_PROJECT"
