FROM node:24-alpine3.21

RUN apk add bash git htop

RUN mkdir test

WORKDIR test

COPY . .

RUN npm ci
