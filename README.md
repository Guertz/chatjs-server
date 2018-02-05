# Server for chat.js
> Developed with nodejs and websockets.
> A minimal Chat application.

## Run
> Completata la preparazione con le dipendenze richieste
```
$ node index.js
```
#### Run as indipendent mode
```
$ nohup node index.js > storage/assets/log.txt 2> storage/assets/err.txt
```

## Dependencies
[nodejs 8.x, npm](https://nodejs.org/en/download/package-manager/)
> In cmd-only environments you may also need:  
[libpng12-0](http://security.ubuntu.com/ubuntu/pool/main/libp/libpng/libpng12-0_1.2.50-1ubuntu2.14.04.2_amd64.deb)  
libcairo2-dev  
libpango1.0-dev  
libgif-dev  

## Configure:
```
$ cd chatjs-server
$
$ npm install
$
$ cp .env.example .env
$ mkdir -p storage/assets
$ node index.js
```
## Folder Structure
```
├── helper                  # My custom sockets helper handler
│   ├── request             # Handler for socket request
│   │   ├── errors          # Error requests type
│   │   └── format          # Format requests type
│   └── response            # Handler for socket response
│       ├── errors          # Error responses type
│       └── format          # Format response type
├── models                  # Data models
├── nodes                   # Web sockets nodes
│   ├── auth                # Authentication/user node
│   ├── chats               # Chats node
│   │   └── sub-nodes       #   Chat node (sub-node of Chats)
│   └── users               # Users node (list of users)
└── storage                 # Storage for local data (db, assets...)
    └── ...
```