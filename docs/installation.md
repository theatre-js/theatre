# How to install

> We've been developing Theatre on the Mac, so there might be some kinks in the beginning if you're on another OS.

#### Clone and install

```bash
$ git clone ssh://git@bitbucket.org/studiojs/studiojs-app.git
$ cd studiojs-app
$ npm install

# there is a bug with socket.io that we need to manually fix every time we run `npm install`
# read more about it here: https://github.com/socketio/engine.io/issues/536
$ rm -rf ./node_modules/uws
```

#### Create the config files

The config is stored in *.env.json files. Let's make one for development:
```bash
$ cp ./sample.env.json ./development.env.json
```


Even though we still don't have production builds, webpack still demands a config file for production.
```bash
$ echo "{}" > ./production.env.json
# @todo: Update the above line when we've started shipping production builds
```

#### Run he webpack builds

We're now ready to runt he webpack builds:

```bash
$ npm run build:dev
```

This runs a bunch of webpack processes for compilling:

1. LB - LauncherBackend (the code that runs in electron's main process)
2. LF - LauncherFrontend (the code that runs in electron's window process)
3. Studio - The code that runs in the user's browser
4. examples - This is just an example studiojs project

#### Run the launcher

If all builds are running without errors, we can run the LB process:

```bash
$ npm run lb:dev
```

This runs a nodemon process that runs LB.

> You can safely ignore this warning:  `/Library/Caches/com.apple.xbs/Sources/AppleGVA/AppleGVA-10.1.17/Sources/Slices/Driver/AVD_loader.cpp: failed to get a service for display 4`


If all has gone well, you should see the electorn window open and show you the launcher.

#### Set up the examples project

The launcher window should show an empty list of projects. Let's add the `examples` folder as a project.

Drag the `examples` folder inside the finder window. Give it any name you wish. If that goes well, you'll see a `studio.json` file created inside the examples folder. Don't worry. It's ignored by git.

#### Launch the examples project

Navigate to `localhost:9092` to see the examples project. Hopefully you'll see the studio running without errors.

## Troubleshooting

@todo