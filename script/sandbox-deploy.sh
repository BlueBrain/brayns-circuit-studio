#!/bin/bash

read -p "Which sandbox do you want to deploy in? (1, 2 or 3)  " SANDBOX
echo "Please enter a comment for this commit:"
read -p "> " COMMENT
git fetch --tags --force
git tag -d sandbox-${SANDBOX}
git tag sandbox-${SANDBOX} -am "${COMMENT}"
git push --force --tags

echo
echo
echo "Wait for GitLab CI to finish:"
echo "  https://bbpgitlab.epfl.ch/viz/brayns/braynscircuitstudio/-/jobs"
echo
echo "If it has succedeed you have to rollup Kubernetes:"
echo "  kubectl rollout restart -n bbp-ou-visualization deployment braynscircuitstudio-sandbox-${SANDBOX}"
echo
echo "Then, you can access the site at this URL:"
echo "  http://s${SANDBOX}.braynscircuitstudio.kcp.bbp.epfl.ch/"
echo