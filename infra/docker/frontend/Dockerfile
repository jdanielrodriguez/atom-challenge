FROM node:18

WORKDIR /app

RUN npm install -g @angular/cli dotenv-cli

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

COPY .env .env

EXPOSE 4200

CMD ["sh", "-c", "node src/generate-env.ts && ng serve --host 0.0.0.0"]
