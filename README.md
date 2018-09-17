# Inspectorium [![wercker status](https://app.wercker.com/status/a6e367248a57edb7771791901f40f5ee/s/master "wercker status")](https://app.wercker.com/project/byKey/a6e367248a57edb7771791901f40f5ee)

Inspect your GitHub source code.

![screencast.gif](screencast.gif)

## Components

- inspectorium-server: A language HTTP server. It's a proxy of [Language Server Protocol](https://microsoft.github.io/language-server-protocol/). It exposes your repository sourcecode information to clients.
- Chrome extension: A client of inspectorium-server. It communicates with the inspectorium-server and displays information of source code over GitHub UI.

## Getting started

### Install and run server

- Install [LSP implementation](https://microsoft.github.io/language-server-protocol/implementors/servers/) you want.
- Install via `npm i @inspectorium/server`
- Setup server config(See [packages/server/README.md](https://github.com/Quramy/inspectorium/blob/master/packages/server/package.json) also).
- Write Dockerfile for inspectorium-server and push it as Docker image.
- Run the Docker image.

For example, this repository is configured as the following:

- Push source code to the master branch.
- Trigger Wercker CI workflow.
- Build and push Docker image to GCP's repository.  
- Deploy the Docker image to GCP's kuberenetes engine.

See [wercker.yml](https://github.com/Quramy/inspectorium/blob/master/wercker.yml) and [k8s directory](https://github.com/Quramy/inspectorium/blob/master/k8s/deployment.tmpl.yml) If you want more details.

### Install chrome extension
See [packages/chrome-extension/README.md](https://github.com/Quramy/inspectorium/blob/master/packages/chrome-extension/README.md).

## License
MIT
