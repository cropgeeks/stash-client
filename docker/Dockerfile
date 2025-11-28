FROM node:22.11-alpine3.20 AS builder

LABEL maintainer="sebastian.raubach@hutton.ac.uk"

ARG BRANCH=master

# Force docker to not cache the next line
ADD https://api.github.com/repos/cropgeeks/stash-client/git/refs/heads/main version.json
# Clone the STASH server code and client code
RUN echo "Pulling GitHub branch: $BRANCH"
RUN apk add --no-cache git && \
    if [ "$BRANCH" = "master" ] ; then git clone -b "main" --single-branch --depth 1 https://github.com/cropgeeks/stash-server.git /opt/stash-server ; else git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/cropgeeks/stash-server.git /opt/stash-server ; fi && \
    if [ "$BRANCH" = "master" ] ; then git clone -b "main" --single-branch --depth 1 https://github.com/cropgeeks/stash-client.git /opt/stash-client ; else git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/cropgeeks/stash-client.git /opt/stash-client ; fi

# Build the client code
WORKDIR /opt/stash-client
RUN rm -f .env && \
    echo "VUE_APP_BASE_URL=./api/" > .env && \
    apk add --no-cache python3 build-base gcc wget && \
    npm i && \
    npm run build && \
    mkdir /opt/stash-server/client/ && \
    cp -a /opt/stash-client/dist/. /opt/stash-server/client/

# Download Gradle and build the server code
RUN apk add --no-cache openjdk21 && \
    wget https://services.gradle.org/distributions/gradle-8.8-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-8.8-bin.zip -d /opt/ && \
    echo "data.directory.external=/data/stash" > /opt/stash-server/config.properties && \
    echo "project.name=stash" >> /opt/stash-server/gradle.properties && \
    /opt/gradle-8.8/bin/gradle -p /opt/stash-server war


FROM tomcat:10.1-jdk21

LABEL maintainer="sebastian.raubach@hutton.ac.uk"

RUN mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT

COPY --from=builder /opt/stash-server/build/libs/stash-*.war /usr/local/tomcat/webapps/ROOT.war

WORKDIR /usr/local/tomcat/
