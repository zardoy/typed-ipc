# Typed IPC

**The most** convenient way to use IPC in electron.

> Still experimental

- [Typed IPC](#typed-ipc)
  - [Why](#why)
  - [Plans](#plans)
  - [Usage](#usage)
  - [How am I Using it](#how-am-i-using-it)
  - [Why this?](#why-this)

## Why?

Because I love refactoring. What if I want to rename the listener or handler? With this module all you have to do is to press one button in VSCode: <kbd>F2</kbd>

## Usage

For usage, see [GUIDE.MD](./GUIDE.MD)

## Plans

- [ ] Guide how to use with preload script (we don't have access to event renderer modules from electron with contextIsolation: true which is default)
- [ ] REACT. Add lots of great hooks for more convenient work from react. I'm highly inspired by @apollo/client. That's why I call *variables* data that must be passed to event.
- [ ] VSCode extension :fire:
- [ ] Review guide style according to [Prisma](https://www.prisma.io/docs/about/style-guide)

## How am I Using it

Please have a look at my Electron apps:
- [Electron Tray Demo](https://github.com/zardoy/electron-tray-demo/search?q="typed-ipc")
- [FilmoMania](https://github.com/zardoy/filmomania-public/search?q="typed-ipc")
<!-- - [advanced-youtube-downloader](https://github.com/zardoy/advanced-youtube-downloader/search?q="typed-ipc") -->

## Why this?

I already have looked at this alternatives:

- https://github.com/orourkek/typesafe-ipc
- https://github.com/deiucanta/electron-typed-ipc

<!-- TODO -->

<!-- what is renderer, main process (side) -->

<!-- write comprehensive guide (and that handlers always takes precedence) -->