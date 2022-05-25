@dir = File.expand_path(File.dirname(__FILE__))
worker_processes 10
working_directory @dir
preload_app true
timeout 30
listen "#{@dir}/tmp/rsyntaxtree.sock", :backlog => 64
pid "#{@dir}/tmp/pids/unicorn.pid"
stderr_path "#{@dir}/log/unicorn.stderr.log"
stdout_path "#{@dir}/log/unicorn.stdout.log"
