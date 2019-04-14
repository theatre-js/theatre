# How to install

TODO

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
