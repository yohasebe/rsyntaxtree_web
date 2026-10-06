# frozen_string_literal: true

Encoding.default_external = Encoding::UTF_8
source "https://rubygems.org"

gem "optimist"
gem "parslet"
gem "rake"
# Not used here directly: cairo loads it on the way to pango, which rsyntaxtree
# needs. Before 0.5.0 it passed a keyword that json 3.0 no longer accepts, so a
# lock holding red-colors 0.4.0 and json 3.x raises when rsyntaxtree is
# required, and the app does not boot. The lock is not tracked, so the one on
# the server lives on between deploys; this keeps json updates from landing on
# top of the old red-colors.
gem "red-colors", ">= 0.5.0"
gem "redcarpet"
gem "rsyntaxtree", ">=2.0.0"
gem "sinatra"
gem "uglifier"
gem "unicorn"
gem "unicorn-worker-killer"
