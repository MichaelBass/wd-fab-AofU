# wd-fab-AofU
All of Us


Create a compose.yaml file from the content below.
update the following db credentials with the ones for your instance.

{mongoadmin}
{mongoadmin_password}

They are into locations.  backend-node: environment DATABASE_URL  and backend-db environment Initial DB credentials

# Compose.yaml  start

services:
  frontend-angular:
    build: frontend/.
    restart: always
    container_name: compose-angular-github
    ports:
      - "8000:80"          
    networks:
      - default

  backend-node:
    build: backend/.
    restart: always
    container_name: compose-express-github
    ports:
      - "3000:3000" 
    environment:
      - DATABASE_URL=mongodb://{mongoadmin}:{mongoadmin_password}@backend-db:27017/wd-fab?authSource=admin          
    networks:
      - default

  backend-db:
    image: mongodb/mongodb-community-server:latest 
    restart: always   
    environment:
      - MONGO_INITDB_ROOT_USERNAME={mongoadmin}
      - MONGO_INITDB_ROOT_PASSWORD={mongoadmin_password}      
    container_name: compose-mongo-github
    ports:
      - "27017:27017" 
    networks:
      - default

networks:
  default:

# Compose.yaml  end


Build and run instructions:

1. Build images
> docker compose build

2. Run contaniners
> docker compose up

3. Create participant
Navigate to localhost:8000/locale/admin   in order to create a participant and select language.
Test admin user credentials are admin1/pwd

4. Once logged in as a admin, you can create a participant.  Participant login url is localhost:8000

