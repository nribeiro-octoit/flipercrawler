FROM node:lts-alpine

WORKDIR /opt/app

ENV PORT=80
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

#daemon for cron jobs
RUN echo 'crond' > /boot.sh

#Chrome and Puppeteer
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

ENV CHROMIUM_PATH="/usr/bin/chromium-browser"

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium


COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

CMD sh /boot.sh && npm start