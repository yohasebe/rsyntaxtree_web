# frozen_string_literal: true

# Gallery reproducibility check.
#
# The gallery is the promise the web UI keeps: a visitor pastes an example
# into the UI and expects the same figure. An example whose options the UI
# cannot send breaks that promise, so every example in the gallery is
# checked here against the options views/index.erb actually offers.
#
# Run after adding a gallery example or changing the UI's option sets:
#
#   RSYNTAXTREE_REPO=/path/to/rsyntaxtree ruby test/gallery_repro_check.rb
#
# Exits 0 when every example is reproducible, 1 with a per-example list of
# what cannot be sent.

require "yaml"

REPO = ENV["RSYNTAXTREE_REPO"] || File.expand_path("../../rsyntaxtree", __dir__)
EXAMPLES_DIR = File.join(REPO, "docs", "_examples")
INDEX_ERB = File.expand_path("../views/index.erb", __dir__)

abort "rsyntaxtree repo not found at #{REPO} (set RSYNTAXTREE_REPO)" unless File.directory?(EXAMPLES_DIR)

require_relative File.join(REPO, "lib", "rsyntaxtree")
require_relative File.join(REPO, "dev", "example_options")

# What views/index.erb lets a user send: select options and radio values,
# keyed by the parameter name.
def ui_option_sets(erb)
  sets = Hash.new { |h, k| h[k] = [] }
  erb.scan(/<select[^>]*name="([^"]+)"[^>]*>(.*?)<\/select>/m) do |name, body|
    body.scan(/value="([^"]*)"/) { |v| sets[name] << v[0] }
  end
  erb.scan(/<input[^>]*type="radio"[^>]*>/) do |tag|
    name = tag[/name="([^"]+)"/, 1]
    value = tag[/value="([^"]*)"/, 1]
    sets[name] << value if name && value
  end
  sets
end

UI = ui_option_sets(File.read(INDEX_ERB))

# How a gallery value (already normalized by ExampleOptions) maps onto what
# the UI can send. nil means "no control needed — the UI default matches".
VALUE_MAP = {
  "color" => ->(v) { { "off" => "none", "on" => "modern" }.fetch(v, v) },
  "fontstyle" => ->(v) { { "sans" => "noto-sans", "serif" => "noto-serif", "mono" => "noto-sans-mono" }.fetch(v, v) },
  # symmetrize: "on" is sent as tidy=symmetric; "off" is the UI default
  "symmetrize" => ->(v) { v == "on" ? ["tidy", "symmetric"] : nil }
}.freeze

# Options checked against a UI control of the same name, and booleans.
DIRECT = %w[tidy direction hyphen leafstyle vheight hspacing linewidth fontsize].freeze
BOOLEAN = %w[polyline mirror transparent hide_default_connectors].freeze

# Front-matter keys that are not drawing options, and the old-to-new name
# mapping the generator applies (dev/example_options.rb).
SKIP_KEYS = %w[name caption category reference].freeze
OLD_KEY_MAP = {
  "line_width" => "linewidth",
  "connector_height" => "vheight",
  "symmetrization" => "symmetrize",
  "connector" => "leafstyle",
  "font" => "fontstyle"
}.freeze

failures = []
Dir.glob(File.join(EXAMPLES_DIR, "*.md")).sort.each do |md|
  name, opts = ExampleOptions.load(md)
  front_matter = YAML.load_file(md)
  front_matter.each do |key, raw_value|
    next if SKIP_KEYS.include?(key) || raw_value.to_s == ""

    key = OLD_KEY_MAP.fetch(key, key)
    value = opts[key.to_sym].to_s
    mapped = VALUE_MAP[key]&.call(value)
    next if mapped.nil? && VALUE_MAP.key?(key) # e.g. symmetrize off: UI default

    param, wanted = mapped.is_a?(Array) ? mapped : [key, mapped || value]

    set = UI[param]
    if set.nil?
      failures << "#{name}: no UI control for '#{param}' (needs #{wanted})"
    elsif !set.include?(wanted)
      failures << "#{name}: UI '#{param}' cannot send #{wanted} (has: #{set.join(', ')})"
    end
  end
end

if failures.empty?
  puts "OK: all #{Dir.glob(File.join(EXAMPLES_DIR, '*.md')).size} gallery examples are reproducible in the web UI"
  exit 0
else
  puts "#{failures.size} problem(s):"
  failures.each { |f| puts "  #{f}" }
  exit 1
end
