# frozen_string_literal: true

Encoding.default_external = Encoding::UTF_8
source "https://rubygems.org"

# json 3.0 dropped the create_additions keyword that red-colors still passes to
# JSON.load, and cairo loads red-colors on the way to pango — so a bundle that
# resolves to json 3.0 raises when rsyntaxtree is required, which here means the
# app does not boot. The constraint holds until red-colors is released against
# the new signature, and comes out when it is.
gem "json", "< 3.0"
gem "optimist"
gem "parslet"
gem "rake"
gem "redcarpet"
gem "rsyntaxtree", ">=2.0.0"
gem "sinatra"
gem "uglifier"
gem "unicorn"
gem "unicorn-worker-killer"
