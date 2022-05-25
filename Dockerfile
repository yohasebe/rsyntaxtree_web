# docker build -t rsyntaxtree/latest .

FROM ubuntu:21.10

RUN apt-get update &&\
    apt-get install -y tzdata && \
    apt-get install -y \
    ca-certificates  \
    build-essential \
    libssl-dev \
    libreadline-dev \
    zlib1g-dev \
    git \
    wget \
    curl \
    rsync \
    nginx \
    mecab \
    libmecab-dev \
    mecab-ipadic-utf8 \
    librsvg2-2 \
    librsvg2-common \
    librsvg2-dev \
    graphviz \
    sqlite3 \
    libsqlite3-dev \
    postgresql-client \
    libpq-dev \
    nodejs \
    imagemagick \
    imagemagick-common \
    libmagickcore-dev \
    libmagickwand-dev \
    libffi-dev \
    zlib1g-dev \
    liblzma-dev \
    libbz2-dev \
    libgirepository1.0-dev && \
    apt-get -y clean && \
    rm -rf /var/lib/apt/lists/*

RUN git config --global http.sslVerify false && \
    git clone https://github.com/rbenv/rbenv.git ~/.rbenv && \
    echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc && \
    echo 'eval "$(rbenv init -)"' >> ~/.bashrc

RUN git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build

RUN ~/.rbenv/bin/rbenv install 3.1.0 && \
    ~/.rbenv/bin/rbenv global 3.1.0

ENV PATH /root/.rbenv/shims:/root/.rbenv/bin:$PATH

RUN mkdir -p /usr/share/fonts/yh
COPY ./fonts/* /usr/share/fonts/yh/
RUN fc-cache -fv

ENV RUBYOPT -EUTF-8

ENV WORKSPACE /rsyntaxtree
ADD . $WORKSPACE
WORKDIR $WORKSPACE
RUN bundle install
CMD ["bundle", "exec", "unicorn"]
