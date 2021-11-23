FROM node:alpine

ENV BRANCH "experimental"

# Make the docker image out of the github repo
#RUN apk add --no-cache openssl \
#    && wget https://github.com/remyla/damas-core/archive/${BRANCH}.zip \
#    && unzip ${BRANCH}.zip \
#    && rm ${BRANCH}.zip \
#    && ln -s /damas-core-${BRANCH}/server-nodejs/ /data \
#    && npm install --prefix /data/ \
#    && apk del openssl

# Make the image out of the local copy
# (comment previous RUN if uncommented)
COPY . /damas-core-${BRANCH}/
RUN ln -s /damas-core-${BRANCH}/server-nodejs/ /data \
     && npm install --prefix /data/

VOLUME /data

WORKDIR /damas-core-${BRANCH}/server-nodejs/

EXPOSE 8090 8443

CMD ["node","."]
