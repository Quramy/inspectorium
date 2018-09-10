FROM node:8

RUN mkdir -p /var/repo
COPY * /var/repo/
COPY packages /var/repo/packages
WORKDIR /var/repo
RUN npm i -g yarn
RUN yarn --pure-lockfile
RUN yarn bootstrap
RUN yarn run tsc -p packages/server

EXPOSE 4000
CMD ["yarn", "start"]
