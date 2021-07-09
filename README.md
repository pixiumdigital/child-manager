# Child Manager

![npm](https://img.shields.io/npm/dm/@pixium-digital/child-manager?color=orange)
![npm](https://img.shields.io/npm/l/@pixium-digital/child-manager?color=orange)
![npm](https://img.shields.io/npm/v/@pixium-digital/child-manager)


Simple library for managing node subprocesses

This tool easily lets you handle multiple sub processes when working in node environment.

Useful for launching your react app, backend and other microservices at the same time without having to have 5 terminal tabs open.

---

# Installation 

To install run the following commands:


```
yarn add @pixium-digital/child-manager
```

You can also use NPM

```
npm install @pixium-digital/child-manager
```

---

# Run

To leverage child manager simply add a configuration file to your project (see below for config details)

You can run thew following command:

```
child-manager
```

By default the loaded config will be at the source of the project and be named `childmanager.json`

If you wish to load a different file just pass the config option.

```
child-manager --config="./myconfig.json"
```

You can then access the manager at the following: http://localhost:7000

---

# Configuration

Here is an example configuration

```
{
  "processes": [
    {
      "name": "Test Service",
      "command": {
        "executor": "node",
        "args": ["TestService.js"],
        "path": "./src/service",
        "isWindows": false
      },
      "maxLogs": 200
    },
    {
      "name": "Service 2",
      "command": {
        "executor": "yarn",
        "args": ["start"],
        "path": "./other-project/service",
        "isWindows": false
      },
      "maxLogs": 200
    }
  ],
  "captureExit": true,
  "longLive": false,
  "debug": false
}
```

Generic configurations:

- `debug`: This will show more logs in the terminal in case something is not working
- `longLive`: This is to force process to stay alive. Use carefully.
- `captureExit`: This binds the exit of child manager so that it will kill all childs

Process configurations:

- `name`: The name of your service
- `maxLogs`: The max number of logs to keep in memory (recommended 200)

- `command`: This houses the command line that will be launched
    - `executor`: The command executor (yarn, npm, node)
    - `args`: Array or extra arguments that should be passed
    - `path`: Where the command should be executed
    - `isWindows`: Is this running on windows system? if yes paths and executors will be automatically changed to be compatible

---

# Development

## Hierarchy

- `dashboard`: The source for the react dashboard
- `lib`: The compiled files for publishing on npm (automated)
- `src`: The source code of the project
    - `__tests__`: Testing folder used to verify code
    - `dashboard`: The built react dashboard (automated)
    - `service`: Test service for tests
    - `utils`: Utility code for the project
    - `ChildManager`: The manager for all the processes
    - `ChildProcess`: A process instance
    - `Cli`: The command line interface

## Contributions

PRs are welcome to contribute to the project

Please follow the following standard for commits:

```
:emoji: action(namespace): Details
```

Examples: 

```
🚀 deploy(package): Updating package.json configuration for deployment
🐛 fix(child-manager): Fix buffer overflow issue
```

More info for gitmoji here https://gitmoji.dev/

## Bugs & Issues

Please follow the creating an issue template for any bugs or problems

# Author

Burlet Mederic
[mederic.burlet@gmail.com](mailto:mederic.burlet@gmail.com)

https://pixiumdigital.com

https://github.com/pixiumdigital