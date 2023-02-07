# frozen_string_literal: true

require "sinatra"

set :bind, "0.0.0.0"
set :environment, :development

require_relative "app"

$SUB_DIRECTORY = "/rsyntaxtree"

run Sinatra::Application

map "/rsyntaxtree" do
  run Sinatra::Application
end
