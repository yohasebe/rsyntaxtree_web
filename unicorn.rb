# frozen_string_literal: true

worker_processes 10
working_directory @dir
preload_app true
timeout 30
listen "#{__dir__}/tmp/rsyntaxtree.sock", backlog: 64
pid "#{__dir__}/tmp/pids/unicorn.pid"
stderr_path "#{__dir__}/log/unicorn.stderr.log"
stdout_path "#{__dir__}/log/unicorn.stdout.log"
