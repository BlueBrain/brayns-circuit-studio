# Brayns Circuit Studio

## URL parameters

* **host**: the address for the Backend; you can provide a node name, hostname (and port) or a full encoded custom url
* **brayns**: (Optional) if defined, it will override the address of Brayns; use this if you need e.g. to debug Brayns locally

## Installation

...

## External Libraries

### hammer js

<https://github.com/hammerjs/hammer.js>

### math.gl

<https://math.gl/>

## Pushing in a Sandbox

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

### Pushing in test

```sh
docker login bbpgitlab.epfl.ch:5050
docker build -t bbpgitlab.epfl.ch:5050/viz/brayns/braynscircuitstudio .
docker push bbpgitlab.epfl.ch:5050/viz/brayns/braynscircuitstudio
kubectl rollout restart -n bbp-ou-visualization deployment braynscircuitstudio-dev
```
