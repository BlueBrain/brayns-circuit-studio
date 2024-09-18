# Brayns Circuit Studio

## URL parameters

* **host**: hostname and port of the Backend.
* **brayns**: (Optional) if defined, it will override the address of Brayns. Use this if you need to debug Brayns locally.

## Installation

...

## External Libraries

### hammer js

https://github.com/hammerjs/hammer.js

### math.gl

https://math.gl/

## Pushing in a Sandbox

## Quick move

```bash
npm run sandbox
```

### Detailed explanation

Add a tag to trigger the CI and create the docker image in Kubernetes.
Available tags are: `sandbox-1`, `sandbox-2`, `sandbox-3`.

Let's see an example for Sandbox 1:

```bash
git tag -d sandbox-1
git tag sandbox-1 -am "Faster rendering blablabla"
git push --force --tags
```

Once the pipeline has run in GitLab, we have to rollup Kubernetes pod:

```bash
kubectl rollout restart -n bbp-ou-visualization deployment braynscircuitstudio-sandbox-1
```
