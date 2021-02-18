# Typed IPC

> **The most** convenient way to use IPC in electron.

> Experimental. API might change

- [Typed IPC](#typed-ipc)
  - [Plans](#plans)
  - [Usage](#usage)
  - [How am I Using it](#how-am-i-using-it)
  - [Why this?](#why-this)

## Plans

- [ ] REACT. Add lots of great hooks for more convenient work from react. I'm highly inspired by @apollo/client. That's why I call *variables* data that must be passed to event.
- [ ] VSCode extension :fire:

## Usage

1. Install it: `npm add https://github.com/zardoy/typed-ipc#build` (sorry for this)
2. Create `ipcSchema.ts` in shared context (make sure it available both in *main* and *renderer* processes) with following content:

```ts
// todo: review do i need to import typed-ipc
declare module "typed-ipc" {
    // events for main process
    interface IpcMainEvents {
        // with variables (data), that must be passed from renderer process
        registerUser: {
            name: string;
            isAdmin: boolean;
        },
        // do not pass any additional variables
        quitApplication: null;
    }

    interface IpcRendererEvents {
        
    }
}
```

That's our IPC schema for the whole application!

TIP: To make sure, that you typed named of interface to augment correctly, hover to it, and you should see `Define your IPC events...`

<!-- TIP: When TODO -->

3. Use it in main process:

<!-- Events, are call it once and forget about it -->

> Almost in 99% you don't need to use event listeners in main process (I'll explain why in step 5)

```ts
// 📁 /electron/ipc.ts
import { typedIpcMain } from "typed-ipc";
import { app } from "electron";

// call it on app load
export const bindIPC = () => {
    typedIpcMain.bindAllEventListeners({
        registerUser: (event, { name, isAdmin }) => {
            // event - standard electron event BUT with typed event.reply !!!
            // ... register user ...
        },
        quitApplication: () => {
            app.quit();
        }
    });
}
```

```ts
// 📁 /electron/index.ts
import { app, BrowserWindow } from "electron";
import { bindIPC } from "./ipc";

export let mainWindow: BrowserWindow | null;

const loadApp = () => {
    bindIPC();
    // create main window
}

app.on("ready", loadApp);
```

As you can see, you must define all event listener for main process. But by doing this we're eliminating the chance to forget to declare the listener for event, that we defined in our schema!

4. Use it in renderer process:

<!-- todo skip this section if you are using react -->

```ts
import { typedIpcRenderer } from "typed-ipc";
// let's assume that we have binded this callback to the button!
const registerUserCallback = () => {
    typedIpcRenderer.send("registerUser", { name: "superUser!", isAdmin: true });
    // if you misspell event name or forget to pass data you'll get a type error
};
// ...
// and somewhere else bind listeners:
typedIpcRenderer.

```

But, for now **there is no** function similar to `typedIpcMain.bindAllListeners()`, fix is coming.

5. Requests!

...

```ts
// 📁 /ipc.ts

import { typedIpcMain } from "typed-ipc";
import { app } from "./";

typedIpcMain.handleAllRequests({
    registerUser: ,
    quitApplication: () => {
        app.quit();
    }
});
```

Of course in huge electron app, you'd split event listeners across files. Let's assume `/` our root for electron code and we're making a file explorer.

## How am I Using it

Please have a look at my Electron apps:
- [Electron Tray Demo](https://github.com/zardoy/electron-tray-demo/search?q="typed-ipc")
- [FilmoMania](https://github.com/zardoy/filmomania-public/search?q="typed-ipc")
<!-- - [advanced-youtube-downloader](https://github.com/zardoy/advanced-youtube-downloader/search?q="typed-ipc") -->

## Why this?

I already have looked at this libs:

- https://github.com/orourkek/typesafe-ipc

<!-- TODO -->

<!-- what is renderer, main process (side) -->

<!-- invokers always uses promise -->

<!-- write comprehensive guide (and that handlers always takes precedence) -->

... Obviously, it's not allowed to use `typedIpcMain` from renderer process and `typedIpcRenderer` from main process.