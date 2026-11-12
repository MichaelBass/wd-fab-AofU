
FROM node:24-bookworm-slim

# Create app directory
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm ci

COPY . /usr/src/app
EXPOSE 443
EXPOSE 3000

CMD [ "npm", "run", "start" ]