#基于alpine的nodejs基础镜像
FROM node:12.10.0-alpine AS builder
MAINTAINER made nodejs by p21 from lit29@chinatelecom.cn
WORKDIR /usr/src/app
#Install dependencied of nodejs on alpine
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk update
RUN apk add --no-cache  python gcc g++ make
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN npm install node-gyp
#Install node_modules
COPY ./package.json ./
RUN cnpm install --production

#拉包
FROM node:12.10.0-alpine
WORKDIR /usr/src/app
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk update && apk add bash tzdata \
  && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
COPY --from=builder /usr/src/app/node_modules node_modules
#copy code && config port  && start 
RUN mkdir config && mkdir -p /data/upload && mkdir -p /data/out
COPY . .
EXPOSE 3000
CMD nohup sh -c 'node server.js'
