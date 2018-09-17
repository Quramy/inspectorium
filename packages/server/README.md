# inspectorium/server

## Install

```sh
$ npm install @inspectorium/server
```

## Setup

You should tell *inspectorium server* a Language Server. The Language Server should be a implementation of [LSP](https://microsoft.github.io/language-server-protocol/implementors/servers/). And you can configure it with `inspectorium.yml`.

For example:

```yaml
# inspectorium.yml

# port: 4000  # web server port
# projectRoot: "." # project root directory
languageServer:
  # command to run LSP server
  command: typescript-language-server
  args:
    - "--stdio"
```

## Start inspectorium-server

```
$ inspectorium-server
```

Or you can also specify a config yaml file name.

```
$ inspectorium-server -c inspectorium.yml
```

## License
MIT
