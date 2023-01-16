FROM node:lts-slim
RUN apt-get update || : && apt-get install -y git
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "run", "deploy" ]