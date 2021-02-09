FROM node:alpine
WORKDIR /server
COPY package*.json yarn.lock ./
RUN ["yarn", "install"]
COPY . .
CMD ["yarn", "watch"] ["yarn", "dev"]
