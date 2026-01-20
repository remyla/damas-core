FROM node:20-alpine
COPY . /damas-core/
WORKDIR /damas-core/server-nodejs/
RUN npm install
VOLUME /data
EXPOSE 8090 8443
CMD ["node","."]
