# frozen_string_literal: true

path = File.expand_path("../", __FILE__)

require 'sinatra'
require "#{path}/app"

# Cache control settings
use Rack::Static,
  :urls => ["/css", "/js", "/images", "/fonts"],
  :root => "public",
  :header_rules => [
    [:all, {
      'Cache-Control' => 'public, max-age=3600',
      'Expires' => proc { (Time.now + 3600).httpdate }
    }],
    [%w(css js), {
      'Cache-Control' => 'public, max-age=86400'
    }]
  ]

$SUB_DIRECTORY = "/rsyntaxtree"

run Sinatra::Application

map '/rsyntaxtree' do
  run Sinatra::Application
end
