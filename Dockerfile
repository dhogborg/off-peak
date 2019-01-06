FROM alpine:3.3

LABEL author d@hogborg.se

RUN apk update && apk add --update ca-certificates
RUN apk add --update tzdata

ADD server/bin/offpeak /usr/bin
ADD build/ /var/www

ENV PORT=8080
ENV GIN_MODE=release

EXPOSE 8080

ENTRYPOINT [ "/usr/bin/offpeak" ]
CMD [ "-static", "/var/www/" ]