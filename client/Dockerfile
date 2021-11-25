# base image base:version -- builder phase
FROM node:alpine as builder
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build

# need to have build folder into nginx
# base image base:version -- builder phase
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# need to copy static content - /usr/share/nginx/html
COPY --from=builder /app/build /usr/share/nginx/html

# Default commands not required for nginx
# CMD ["npm", "run", "start"]