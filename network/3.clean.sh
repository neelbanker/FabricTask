echo "################## Bringing Network Down ###########################"
./byfn.sh down

echo "################## Bringing Dockers Down ###########################"
docker rm -f $(docker ps -aq)

echo "################## Removing Channel Artifacts ###########################"
rm -rf channel-artifacts


echo "################## Docker Network Prune ###########################"
docker network prune

echo "################## Docker Volume Prune ###########################"
docker volume prune

echo "################## Docker System Prune ###########################"
docker system prune

echo "################## Remaking Channel Artifacts Folder ########################"
mkdir channel-artifacts