FROM ubuntu:jammy

LABEL author d@hogborg.se

RUN apt-get update && apt-get install -y ca-certificates

ADD server/bin/offpeak /usr/bin
ADD build/ /var/www

ENV PORT=8080
ENV GIN_MODE=release

EXPOSE 8080

ENTRYPOINT [ "/usr/bin/offpeak" ]
CMD [ "-static", "/var/www/" ]