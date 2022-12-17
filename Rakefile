$LOAD_PATH << File.dirname(__FILE__)

require 'lib/rsyntaxtree_web/version'
require 'uglifier'
require_relative './lib/rsyntaxtree_web/version.rb'

class String
  def strip_heredoc
    gsub(/^#{scan(/^[ \t]*(?=\S)/).min}/, ''.freeze)
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
    if ext == ".js" || ext == ".css"
      filename = base + "." + RSyntaxTreeWeb::VERSION + ".min" + ext
    end
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
  `docker build -t rsyntaxtree/latest .`
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
  sh <<-EOS.strip_heredoc, {verbose: false}
    /bin/bash -xeu <<'BASH'
      # docker buildx create --name mybuilder
      # docker buildx use mybuilder
      # docker buildx inspect --bootstrap
      docker buildx build --platform linux/amd64,linux/arm64 -t yohasebe/rsyntaxtree:#{RSyntaxTreeWeb::VERSION} -t yohasebe/rsyntaxtree:latest . --push
    BASH
  EOS
end

