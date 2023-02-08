# frozen_string_literal: true

require "uglifier"
require_relative "lib/rsyntaxtree_web/version"

class String
  def strip_heredoc
    gsub(/^#{scan(/^[ \t]*(?=\S)/).min}/, "")
  end
end

desc "Minify JavaScript files"
task :minify do
  path = File.dirname(__FILE__) + '/public'
  files = ["/js/rsyntaxtree.js", "/css/rsyntaxtree.css"]
  puts "Minifying and renameing JS and CSS . . ."
  files.each do |f|
    base = File.basename(f, ".*")
    ext = File.extname(f)
    subpath = File.expand_path(path + f + '/../') + '/'
    `rm -rf #{subpath}#{base}.*.min#{ext}`
    filename = base + "." + RSyntaxTreeWeb::VERSION + ".min" + ext if [".js", ".css"].include? ext
    newfile = subpath + filename
    puts filename
    File.open(newfile, "wb+") do |g|
      if ext == ".js"
        g.puts Uglifier.new.compile(File.read(path + f))
      else
        g.puts File.read(path + f)
      end
    end
  end
end

desc "Build Docker Environment"
task :build do
  `docker build -t rsyntaxtree:latest .`
end

desc "Start Server"
task :start do
  puts "Server is running"
  puts "Access http://localhost:8080/"
  puts "Press Ctrl+C to stop server"
  `./bin/start_server`
end

desc 'Push Docker images'
task :push do
  sh <<-DOCKER.strip_heredoc, { verbose: false }
    /bin/bash -xeu <<'BASH'
      docker buildx create --name mybuilder
      docker buildx use mybuilder
      docker buildx inspect --bootstrap
      docker buildx build --platform linux/amd64,linux/arm64 -t yohasebe/rsyntaxtree:#{RSyntaxTreeWeb::VERSION} -t yohasebe/rsyntaxtree:latest . --push
    BASH
  DOCKER
end
