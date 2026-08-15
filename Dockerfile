FROM ruby:3.4-alpine
ENV WORKSPACE=/rsyntaxtree
WORKDIR $WORKSPACE
ADD Gemfile $WORKSPACE

RUN apk update && \
    apk upgrade && \
    apk add --no-cache linux-headers libxml2-dev make gcc libc-dev bash && \
    apk add --no-cache librsvg librsvg-dev pango-dev imagemagick imagemagick-dev xz-dev libbz2 && \
    apk add --no-cache gobject-introspection gobject-introspection-dev && \
    apk add --no-cache -t .build-packages --no-cache build-base curl-dev wget gcompat && \
    bundle install -j4

# Fonts come from the distribution, not from the repository: rsyntaxtree 1.8.0
# resolves families through fontconfig, so any installed script renders.
RUN apk add --no-cache \
      font-noto font-noto-cjk font-noto-cjk-extra font-noto-emoji font-noto-math \
      font-noto-arabic font-noto-hebrew font-noto-devanagari font-noto-thai && \
    fc-cache -f

ADD . $WORKSPACE
CMD ["bundle", "exec", "unicorn"]
