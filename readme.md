# RSyntaxTree Web UI

This is an web UI source code package for [RSyntaxTree](https://github.com/yohasebe/rsyntaxtree), a command line app to generate linguistic syntax trees. With this, you can run your local copy of RSyntaxTree on Docker installed on your own computer.

**Changelog**

- [June, 2026] Prebuilt images moved to the GitHub Container Registry (GHCR); the Docker Hub image is deprecated
- [February, 2025] Japanese version web UI is added
- [December, 2022] Docker Hub images are available
- [December, 2022] Base Docker image is changed to Alpine
- [November, 2022] Minified JS and CSS are included

You can setup a docker container using either the prebuilt image from the GitHub Container Registry or building a Docker image locally.

## Usage 1: Use the prebuilt image (Recommended)

The prebuilt multi-arch image (linux/amd64, linux/arm64) is published on the **GitHub Container Registry (GHCR)**.

### Setup

1. Download and install Docker Desktop ([Windows](https://docs.docker.com/desktop/windows/install/) / [MacOS](https://docs.docker.com/desktop/mac/install/) / [Linux](https://docs.docker.com/desktop/linux/install/)).
2. Start Docker Desktop.

### Start Server

1. Run the following command in a terminal and set up the Docker image. This may take a while the first time. 

```
docker run -it -p 8080:8080 ghcr.io/yohasebe/rsyntaxtree
```

> **Note:** The Docker Hub image (`yohasebe/rsyntaxtree`) is **deprecated** and no longer updated. Please switch to the GHCR image above. Existing Docker Hub tags are kept for backward compatibility but will not receive new versions.

When you have `INFO -- : worker=0 ready` shown in the terminal, the setup is complete.

2. Access the folloing URL in a web browser

```
http://localhost:8080
```

3. You can stop the server with `Ctrl + c` in the terminal

## Usage 2: Build Docker Image Locally

### Setup

1. Download and install Docker Desktop ([Windows](https://docs.docker.com/desktop/windows/install/) / [MacOS](https://docs.docker.com/desktop/mac/install/) / [Linux](https://docs.docker.com/desktop/linux/install/)).
2. Start Docker Desktop.
3. Clone this repository, or download and extract the [ZIP package](https://github.com/yohasebe/rsyntaxtree_web/archive/refs/heads/main.zip).
4. Open a terminal and go to the project root folder.
5. Run the following command and build the Docker image. This may take a while.

```
docker build -t rsyntaxtree .
```

### Start Server

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
http://localhost:8080
```

4. You can stop the server with `Ctrl + c` in the terminal

**NOTE:** Setup tutorial is also available in [Chinese](https://zhuanlan.zhihu.com/p/585260718) (thanks to Kent)
