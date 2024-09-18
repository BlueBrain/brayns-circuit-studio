# Build ReactJS application
ARG BCS_NODE_IMAGE_VERSION=18.15.0
ARG BCS_NGINX_IMAGE_VERSION=stable-alpine

# Build React app
FROM node:${BCS_NODE_IMAGE_VERSION} as builder
WORKDIR /app
ADD . /app
RUN npm install && \
    npm run build

# Build Nginx server
FROM nginx:${BCS_NGINX_IMAGE_VERSION}

# This argument specifies the "subdirectory" path for the build version
# of the application e.g. if we run it on http://bbpteam.epfl.ch/viz/braynscircuitstudio/
# then BCS_BASE_PATH argument should be `viz/braynscircuitstudio`
ARG BCS_BASE_PATH=""

ARG BCS_NGINX_HTML_ROOT=/usr/share/nginx/html
ARG BCS_BUILD_PATH=/app/build

# Copy app artifacts
COPY --from=builder ${BCS_BUILD_PATH} ${BCS_NGINX_HTML_ROOT}

# Fix a bug that occurs only in Kaniko.
# @see https://github.com/GoogleContainerTools/kaniko/issues/1278
RUN test -e /var/run || ln -s /run /var/run

# Add Nginx configuration file and change the base path
ADD ./deployment/nginx/default.conf /etc/nginx/conf.d
ADD deployment/nginx/alias.locations /etc/nginx/conf.d

# Set up Nginx cache and log directories
ADD ./deployment/nginx/setup-nginx.sh /tmp
RUN chmod +x /tmp/setup-nginx.sh && /tmp/setup-nginx.sh

# Add permissions for Nginx user
RUN chown -R nginx:nginx ${BCS_NGINX_HTML_ROOT} && chmod -R 755 ${BCS_NGINX_HTML_ROOT} && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid
RUN chown -R nginx:nginx /var/run/nginx.pid

USER nginx
