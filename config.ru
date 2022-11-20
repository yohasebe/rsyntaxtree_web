path = File.expand_path("../", __FILE__)

require 'sinatra'

set :bind, '0.0.0.0'
set :environment, :development

require "#{path}/app"

$SUB_DIRECTORY = "/rsyntaxtree"

run Sinatra::Application

map '/rsyntaxtree' do
  run Sinatra::Application
end

