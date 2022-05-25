# RSyntaxTree on the Web

Author: Yoichiro Hasbe

## Setup Docker Image

1. Download and install [Docker Desktop](https://docs.docker.com/desktop/).
2. Run Docker Desktop.
3. Open a terminal and go to the project root folder.
4. Run the following command and build the Docker image. This may take a while.

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
./bin/run_server
```

3. Access the folloing URL in a web browser

```
http://localhost:8080/rsyntaxtree
```

4. You can stop the server with `Ctrl + c` in the terminal
