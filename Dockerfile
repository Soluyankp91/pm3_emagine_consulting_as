FROM node:16.19 as builder
ENV NODE_OPTIONS=--max_old_space_size=4096
WORKDIR /src
RUN npm install --global @angular/cli
COPY package.json package-lock.json yarn.lock ./
RUN yarn
COPY . . 
RUN npm run docker-tests

FROM nginx:latest
COPY --from=builder  /src/dist/PM3 /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443