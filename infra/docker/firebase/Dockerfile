FROM node:18

RUN apt-get update && apt-get install -y default-jdk && apt-get clean

RUN npm install -g firebase-tools

WORKDIR /firebase/config

COPY firebase/functions/package.json firebase/functions/package-lock.json ./firebase/functions/

RUN cd firebase/functions && npm install --legacy-peer-deps

COPY firebase/ .

ENTRYPOINT ["firebase"]
