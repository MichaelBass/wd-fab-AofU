# wd-fab-AofU
All of Us

The https branch requires certificates that are loaded from host volumes defined in the compose.yaml (see compose.yaml example below)

  Generate https certificates and key:

  ssl-cert.crt
  ssl-cert.key
  ssl-cert-bundle.crt

  The ssl-cert-bundle.crt  contains the CA certificate along with the site certificate.


Update the compose.yaml file db credentials with the ones for your instance.

{mongoadmin}
{mongoadmin_password}

They are in two locations.  backend-node: environment DATABASE_URL  and backend-db environment Initial DB credentials


Update the frontend-angular: service environment variable with the name of the site (i.e. {localhost} --> {sitename})

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
    volumes:
      - "~/certs/ssl-cert.crt:/etc/ssl/certs/ssl-cert.crt"
      - "~/certs/ssl-cert.key:/etc/ssl/certs/ssl-cert.key"
      - "~/certs/ssl-cert-bundle.crt:/etc/ssl/certs/ssl-cert-bundle.crt"       

  frontend-angular:
  
    build: frontend/.
    restart: always
    container_name: compose-angular-github
    environment:
      - SERVER_NAME=localhost    
    ports:
      - "443:443"
    networks:
      - default
    volumes:
      - "~/certs/ssl-cert.crt:/etc/ssl/certs/ssl-cert.crt"
      - "~/certs/ssl-cert.key:/etc/ssl/certs/ssl-cert.key"      

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
    volumes:
      - "~/certs/ssl-cert.crt:/usr/src/app/ssl-cert.crt"
      - "~/certs/ssl-cert.key:/usr/src/app/ssl-cert.key"
      - "~/certs/ssl-cert-bundle.crt:/usr/src/app/ssl-cert-bundle.crt"      

  backend-db:
  
    image: mongodb/mongodb-community-server:latest 
    restart: always   
    environment:
      - MONGODB_INITDB_ROOT_USERNAME=mongoadmin
      - MONGODB_INITDB_ROOT_PASSWORD=mongoadmin_password
    container_name: compose-mongo-github
    ports:
      - "27017:27017" 
    networks:
      - default
    volumes:
      - "~/mongodb:/data/db"


# Compose.yaml  end

Build and run instructions:


1. Integration the GO engine source code from the following external Git repo: (for convenience, the repo is duplicated in this branch with modification to use https in file "\pkg\web\server.go")
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

4. Creating admin credentials by posting an admin json object to the admin endpoint.
    An example of an admin object is below, using a docker running on localhost

    curl  --location 'https://localhost:3000/admin' \
          --header 'Content-Type: application/json' \
          --data-raw '{
          "oid":{primary key for record (int)},
          "username":"{login name for admin user}", 
          "password":"{password for admin user}",
          "sponsor_code":"{string that groups particpant data - study/project code}",
          "email":"{email for admin user}",
          "sms":""
          }'

5. To edit admin credentials use the PUT verb.
    oid and sponsor_code are composite primary keys and username, password and email are editable fields.

    curl  --location --request PUT 'https://localhost:3000/admin' \
          --header 'Content-Type: application/json' \
          --data-raw '{
          "oid":{primary key for record (int)},
          "username":"{login name for admin user}", 
          "password":"{password for admin user}",
          "sponsor_code":"{string that groups particpant data - study/project code}",
          "email":"{email for admin user}",
          "sms":""
          }'

6. Create participant
Navigate to https://localhost/locale/admin  in order to create a participant and select language.

7. Once logged in as a admin, you can create a participant.  Participant login url is localhost:443          
