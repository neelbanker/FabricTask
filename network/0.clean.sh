# Docker part start
  echo "================================================================="
  echo "Displaying all running containers"
  echo "================================================================="
  # Displaying all running containers
  docker ps -a
  echo "================================================================="
  echo "Stopping all running containers"
  echo "================================================================="
  # Stop all the running containers
  docker stop $(docker ps -aq)
  echo "================================================================="
  echo "Removing all stopped containers"
  echo "================================================================="
  # Removing all the stopped containers
  docker rm $(docker ps -aq)
  echo "================================================================="
  echo "Clearing the volume space"
  echo "================================================================="
  # Cleaning up the stopped containers volumes
  docker volume prune
  echo "================================================================="
  echo "All stopped containers and volumes removed"
# Docker part end
