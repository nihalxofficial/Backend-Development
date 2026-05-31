# WSL, Ubuntu & Docker — Complete Beginner Guide
**Common problems, fixes, and essential commands**

---

## PART 1 — WSL Problems & Fixes

### Problem: WSL not installed
```powershell
wsl --install
```

### Problem: WSL version not set to 2
```powershell
wsl --set-default-version 2
```

### Problem: No Linux distribution installed
```powershell
wsl --install -d Ubuntu
```

### Problem: WSL won't start / stuck
```powershell
wsl --shutdown
wsl -d Ubuntu
```

### Problem: Need to check what's installed
```powershell
wsl -l -v
```
Shows name, state (Running/Stopped) and version of each distro.

### Problem: WSL needs updating
```powershell
wsl --update
```

### Problem: Want to start fresh / reset Ubuntu
```powershell
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```
⚠️ This deletes all Ubuntu data — use carefully.

---

## PART 2 — Ubuntu Basic Commands

Open Ubuntu anytime via **Start Menu → search "Ubuntu"**

### Navigation
```bash
pwd               # show current folder location
ls                # list files and folders
ls -la            # list with details and hidden files
cd foldername     # go into a folder
cd ..             # go back one folder
cd ~              # go to home folder
```

### Files & Folders
```bash
mkdir myfolder          # create new folder
touch myfile.txt        # create new empty file
cp file.txt backup.txt  # copy a file
mv file.txt newfolder/  # move a file
rm file.txt             # delete a file
rm -rf myfolder         # delete a folder and everything inside
```

### Install Software
```bash
sudo apt update           # refresh package list (always run first)
sudo apt install git      # install git
sudo apt install python3  # install python
sudo apt install nodejs   # install nodejs
```

### Access Windows Files from Ubuntu
```bash
cd /mnt/c/Users/MY\ PC/    # go to your Windows C drive
ls                          # see your Windows files
```

---

## PART 3 — Docker Problems & Fixes

### Problem: Docker engine stuck on "starting"
1. Quit Docker from taskbar
2. Run in PowerShell:
```powershell
wsl --shutdown
wsl -d Ubuntu
```
3. Reopen Docker Desktop

### Problem: WSL integration not working
- Docker Desktop → Settings → Resources → WSL Integration
- Toggle **Ubuntu ON** ✅
- Click Apply & Restart

### Problem: Docker needs reinstalling cleanly
```powershell
# Delete leftover files
Remove-Item -Recurse -Force "$env:APPDATA\Docker"
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Docker"
Remove-Item -Recurse -Force "$env:PROGRAMDATA\Docker"
```
Then download fresh from docker.com → pick **AMD64** for Intel laptops.

### Problem: Check if Docker is running
```powershell
docker --version
docker info
```

---

## PART 4 — Docker Basic Commands (Most Used)

### Check Docker is working
```bash
docker --version        # check Docker version
docker info             # full system info
docker ps               # list running containers
docker ps -a            # list all containers including stopped
```

### Images (the blueprint of a container)
```bash
docker images                    # list downloaded images
docker pull ubuntu               # download ubuntu image
docker pull nginx                # download nginx image
docker rmi imagename             # delete an image
```

### Containers (running instance of an image)
```bash
# Run a container
docker run imagename

# Run with a name
docker run --name mycontainer imagename

# Run in background (detached)
docker run -d imagename

# Run and open terminal inside
docker run -it ubuntu bash

# Run with port mapping (your port : container port)
docker run -p 8080:80 nginx
```

### Start / Stop Containers
```bash
docker start containername      # start a stopped container
docker stop containername       # stop a running container
docker restart containername    # restart a container
docker rm containername         # delete a container
```

### Go Inside a Running Container
```bash
docker exec -it containername bash
```

### Logs & Monitoring
```bash
docker logs containername         # see container logs
docker logs -f containername      # live follow logs
docker stats                      # live CPU/RAM usage of containers
```

### Clean Up Everything
```bash
docker system prune               # delete all stopped containers and unused images
docker container prune            # delete only stopped containers
docker image prune                # delete only unused images
```

---

## PART 5 — Quick Reference Card

| Task | Command |
|---|---|
| Check WSL distros | `wsl -l -v` |
| Start Ubuntu | `wsl -d Ubuntu` |
| Shutdown WSL | `wsl --shutdown` |
| Check Docker version | `docker --version` |
| List running containers | `docker ps` |
| List all containers | `docker ps -a` |
| Run a container | `docker run imagename` |
| Stop a container | `docker stop name` |
| Delete a container | `docker rm name` |
| List images | `docker images` |
| Delete an image | `docker rmi imagename` |
| Open terminal in container | `docker exec -it name bash` |
| Clean up Docker | `docker system prune` |

---

*Keep this guide handy — these commands cover 90% of daily Docker and WSL use.*
