$LOAD_PATH << File.dirname(__FILE__)

require 'lib/rsyntaxtree_web/version'
require 'uglifier'

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
