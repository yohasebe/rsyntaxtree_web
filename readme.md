# RSyntaxTree Web UI

This is an web UI source code package for [RSyntaxTree](https://github.com/yohasebe/rsyntaxtree), a command line app to generate linguistic syntax trees. With this, you can run your local copy of RSyntaxTree on Docker installed on your own computer.

## Changelog

- [November 20, 2022] Minified JS and CSS are included
- [November 19, 2022] Docker Ubuntu image updated to 22.04

## Setup

Setup tutorial is also available in [Chinese](https://zhuanlan.zhihu.com/p/585260718) (thanks to Kent)

1. Download and install Docker Desktop ([Windows](https://docs.docker.com/desktop/windows/install/) / [MacOS](https://docs.docker.com/desktop/mac/install/) / [Linux](https://docs.docker.com/desktop/linux/install/)).
2. Start Docker Desktop.
3. Clone this repository, or download and extract the [ZIP package](https://github.com/yohasebe/rsyntaxtree_web/archive/refs/heads/main.zip).
4. Open a terminal and go to the project root folder.
5. Run the following command and build the Docker image. This may take a while.

```
docker build -t rsyntaxtree/latest .
```

## Start Server

1. Make the server script executable.

```
chmod a+x ./bin/start_server
```

2. Start RSyntaxTree server.

```
./bin/start_server
```

3. Access the folloing URL in a web browser

```
http://localhost:8080/rsyntaxtree
```

4. You can stop the server with `Ctrl + c` in the terminal

