FROM node:22 
WORKDIR /usr/local/anread/anread-web

COPY ./package.json ./
COPY ./lib/epubjs ./lib/epubjs
RUN npm install
COPY ./index.html ./jsconfig.json ./vite.config.js ./
COPY ./src ./src
COPY ./public ./public

EXPOSE 5173
CMD ["npm", "run", "dev"]
