echo "################## Bringing Network Down ###########################"
docker ps -a


echo "================================================================="
echo "Stopping all running containers"
echo "================================================================="
# Stop all the running containers
docker stop $(docker ps -aq)

echo "################## Bringing Dockers Down ###########################"
docker rm -f $(docker ps -aq)

echo "################## Removing Channel Artifacts ###########################"
rm -rf channel-artifacts

#echo "################## Removing Crypto Config ###########################"
#sudo rm -rf crypto-config

echo "################## Docker Network Prune ###########################"
echo "y"|docker network prune

echo "################## Docker Volume Prune ###########################"
echo "y"|docker volume prune

echo "################## Docker System Prune ###########################"
echo "y"|docker system prune

echo "################## Remaking Channel Artifacts Folder ########################"
mkdir channel-artifacts

docker rmi -f $(docker images | grep peer[0-9]-peer[0-9] | awk '{print $3}')

rm -rf ./hfc-key-store2
#rm -rf ./mychannel.block
clear
ls
docker ps -a
docker images

rm -rf ../../../../.hfc-key-store