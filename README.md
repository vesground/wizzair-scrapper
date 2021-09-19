***Build***
docker build . -t wizz

***Save build***
docker save --output public/wizz.tar wizz

***List***
docker images

***Run***
docker run -d wizz

***Send to remote***
https://medium.com/@sanketmeghani/docker-transferring-docker-images-without-registry-2ed50726495f