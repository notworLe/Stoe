# Docker

Dockfiler -> image -> Run image

## Dockfiler
```bash
# Build into image
## -p: port
## -d: Detached mode (chạy ở background)
## --name: name container
docker build -d -p <host_port>:<container_port> --name <your_name> <name_image>

```

# Cleaning
```bash
docker system df
docker builder prune -a -f
docker image prune -a -f
```