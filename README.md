# wd-fab-AofU
All of Us


Create a compose.yaml file from the content below.
update the following db credentials with the ones for your instance.

{mongoadmin}
{mongoadmin_password}

They are in two locations.  backend-node: environment DATABASE_URL  and backend-db environment Initial DB credentials

# Compose.yaml  start

services:


  wd-fab-go:
  
    build: gofabulouscat/.
    restart: always
    container_name: compose-go-github
    ports:
      - "3001:3001"
    networks:
      - default

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
      - DATABASE_URL=mongodb://mongoadmin:mongoadmin_password@backend-db:27017/wd-fab?authSource=admin
    networks:
      - default

  backend-db:
  
    image: mongodb/mongodb-community-server:latest 
    restart: always   
    environment:
      - MONGO_INITDB_ROOT_USERNAME=mongoadmin
      - MONGO_INITDB_ROOT_PASSWORD=mongoadmin_password
    container_name: compose-mongo-github
    ports:
      - "27017:27017" 
    networks:
      - default

networks:
  default:

# Compose.yaml  end

Build and run instructions:


1. Integration the GO engine source code from the following external Git repo:
 https://github.com/CC-RMD-EpiBio/gofabulouscat 


The directory structure should be the following before building the images:

    README.md
  
    compose.yaml
  
    \backend
  
    \frontend
  
    \gobulouscat


2. Build images
> docker compose build

3. Run contaniners
> docker compose up

4. Create participant
Navigate to localhost:8000/locale/admin   in order to create a participant and select language.
Test admin user credentials are admin1/pwd

5. Once logged in as a admin, you can create a participant.  Participant login url is localhost:8000

