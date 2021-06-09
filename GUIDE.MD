> For quick usage example see [tests file](build/index.test-d.ts).

Install it: `npm add typed-ipc`

## Define IPC schema

Create `ipcSchema.ts` in shared directory (make sure it available both in *main* and *renderer* processes) with following content:

<!-- todo paste docs link -->
```ts
// 📁 shared/ipcSchema.ts

declare module "typed-ipc" {
    // events for main process
    interface IpcMainEvents {
        logUserAction: {
            // here we define variables (data), that must be passed from renderer process
            userId: string;
            action: "click" | "somethingElse";
            isMad?: boolean;
        },
        // for this event we don't need to pass data
        quitApplication: null;
    }

    interface IpcRendererEvents {
        sayHiToUser: {
            makeUserSad: boolean;
        }
    }
}

// make it a module
export {};
```

That's our IPC schema for the whole application!

> TIP: To make sure, that you typed named of interface to augment correctly, hover to it and you should see `Define your IPC events...`

<!-- TIP: When TODO -->

> Remember: You can't use `typedIpcMain` from renderer process and `typedIpcRenderer` from main process.

## Main process

> Almost in 90% you don't need to use event listeners in main process (I'll explain why in step 5)

```ts
// 📁 electron/ipc.ts
import { typedIpcMain } from "typed-ipc";
import { app } from "electron";

// call it on app load (before web page is loaded)
export const bindIPC = () => {
    typedIpcMain.bindAllEventListeners({
        // ALL events listeners from the schema must be defined here!
        quitApplication: () => {
            app.quit();
        },
        logUserAction: (_event, { userId, action, isMad = false }) => {
            // ... do logging stuff
        }
    });
}
```

```ts
// 📁 electron/index.ts
import { app, BrowserWindow } from "electron";
import { bindIPC } from "./ipc";

export let mainWindow: BrowserWindow | undefined;

const loadApp = () => {
    bindIPC();
    // create main window
}

app.on("ready", loadApp);
```

> By defining all event listeners in one place we're eliminating the chance to forget to implement the listener for event, that we defined in our schema. Just comment events that you aren't ready to implement.

## Renderer process

### Context isolation

In Electron 12 or later, `contextIsolation: true` and `nodeIntegration: false` by default. Context isolation requires you to pass ipcRenderer parts into renderer modules via preload script (you can't `require` or `import "electron"`).

You have to either disable `contextIsolation` and enable `nodeIntegration` or use preload script and alias the `electron` module, like [I did in my project](https://github.com/zardoy/filmomania-public/tree/main/src/electron/preload.ts).

But remember to not to load any remote content in this window including scripts / styles from CDN. Never use CDN in Electron! For any kind of remote content (sites etc) create another windows.

### Usage

Use events, where you don't care about the result, you just need to call something in main process and forget about that. For example:

<!-- todo skip this section if you are using react -->

```ts
import { typedIpcRenderer } from "typed-ipc";
// let's assume that we have binded this callback to the button!
const registerUserCallback = () => {
    typedIpcRenderer.send("logUserAction", { userId: 5, action: "click" });
    // if you misspell event name or forget to pass data you'll get a type error
};
```

<!-- // and somewhere else bind listeners: -->

Also, **there is no** alternative to `typedIpcMain.bindAllListeners()` (at least for now).

## Requests

In 90% you need to use requests, because they're more conveniet to use then events. If even don't need to return data from main process, with requests you would always know when the process is successfully done.

- Requests are always async
- If you get an error in main process it will be thrown in the renderer, right where you've called `request`

To use requests, firstly define them in your schema:

```ts
// 📁 shared/ipcSchema.ts
declare module "typed-ipc" {
    // ... optional events go here
    interface IpcMainRequests {
        registerUser: {
            variables: {
                name: string;
            };
            response: {
                id: number;
            };
        }
        getUsersList: {
            response: {
                users: Array<{ id: number; string: name; }>
            }
        }
        setUserName: {
            variables: {
                id: number;
                name: string;
            }
        }
    }
}
```

```ts
// 📁 /ipc.ts
// MAIN PROCESS

import { typedIpcMain } from "typed-ipc";
import { app } from "electron";
import setUserName from "./requests/setUserName";

typedIpcMain.handleAllRequests({
    async registerUser() {
        // ... do the registration process
        // give the result
        return {
            id: 50
        }
    },
    async getUsersList() {
        return await prisma.users.findMany({
            include: {
                name: true
            }
        });
    },
    // in case if our function too big we can define it in another file
    setUserName
});
```

```ts
    // 📁 /requests/setUserName.ts
    const setUserName: IpcMainHandler<""> = () => {};
    export default setUserName;
```
> Note: default exports is fine until your exports/imports follow the file name

<!-- TODO describe errors -->

```ts
// 📁 /index.ts
// RENDERER PROCESS

import { typedIpcRenderer } from "typed-ipc";

const clickButtonHandler = () => {
    const { internalId } = await typedIpcRenderer.request("registerUser", {
        name: "prostoUser"
    });
}
```

<!-- Of course in huge electron app, you'd split event listeners across files. Let's assume `/` our root for electron code and we're making a file explorer. -->
