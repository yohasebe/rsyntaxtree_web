# frozen_string_literal: true

require "redcarpet"
require "sinatra"
require "base64"
require "securerandom"
require "json"
require "rsyntaxtree"

require_relative "lib/rsyntaxtree_web/version"

$RSYNTAXTREE_VER = Gem.loaded_specs["rsyntaxtree"].version.to_s

# Use Google Analytics code only if the code file exists
ga_path = File.dirname(__FILE__) + "/google_analytics_tracking_code"
if File.exist?(ga_path)
  gfile = File.open(ga_path, "r:UTF-8:UTF-8")
  $GOOGLE_CODE = gfile.read
  gfile.close
else
  $GOOGLE_CODE = ""
end

class CustomRenderer < Redcarpet::Render::HTML
  def image(link, title, alt_text)
    if title =~ /([^=\s]+)=([^=\s]+)/
      %(<a href="#{link}" target="_blank"><img src="#{link}" #{$1}="#{$2}" class=md-img' alt="#{alt_text}" /></a>)
    else
      %(<a href="#{link}" target="_blank"><img src="#{link}" title="#{title}" class='md-img' alt="#{alt_text}" /></a>)
    end
  end

  def table(header, body)
    "<table class='table table-sm table-bordered '>" \
      "<thead>#{header}</thead>" \
      "<tbody>#{body}</tbody>" \
      "</table>"
  end
end

markdown = Redcarpet::Markdown.new(CustomRenderer, autolink: true, fenced_code_blocks: true, tables: true, with_toc_data: true)
about_md = File.read(File.dirname(__FILE__) + "/about.md")
ABOUT_HTML = markdown.render(about_md)

about_md_ja = File.read(File.dirname(__FILE__) + "/about_ja.md")
ABOUT_HTML_JA = markdown.render(about_md_ja)

configure do
  enable :sessions
end

# Helper method: asset version management
helpers do
  def asset_version
    # Always use latest version in development, use version number in production
    if settings.development?
      Time.now.to_i.to_s
    else
      RSyntaxTreeWeb::VERSION
    end
  end
end

# What this site is, for a program reading rather than a person looking — the
# convention proposed as /llms.txt. It carries no notation of its own: the
# notation is documented once, on the documentation site, and a second copy here
# would drift from it. What it does carry is the one thing a model arriving at
# this address cannot work out for itself, which is where that documentation is.
get "/llms.txt" do
  content_type "text/plain; charset=utf-8"
  <<~TXT
    # RSyntaxTree

    > A generator for linguistic syntax trees. The input is labeled bracket
    > notation; the output is PNG, SVG or PDF. This address is the web
    > interface: paste the notation into the editor and press Draw.

    Writing the notation is the part worth reading about first. Several
    characters in it already mean something, and the reference leads with
    those.

    ## The notation

    - [The reference, on one page](https://yohasebe.github.io/rsyntaxtree/notation.txt):
      the characters that already mean something, then every feature at a
      line each, then the options.
    - [Everything in one file](https://yohasebe.github.io/rsyntaxtree/llms-full.txt):
      the reference, the manual and every example in the gallery.

    ## Running it yourself

    - [Command line and library](https://github.com/yohasebe/rsyntaxtree):
      `rsyntaxtree --notation` prints the reference, `--examples` prints the
      gallery, and `--validate` reports what is wrong with an input as JSON
      without drawing it.
  TXT
end

# the default / route, whose views are in the '/views' directory
get '/' do
  erb :index
end

# set '/ja' to the Japanese version of the site, whose views are in the '/views/ja' directory
get '/ja' do
  erb :"ja/index", :layout => :"ja/layout"
end

# A failure answers with the human-readable message as before, plus the
# structured diagnosis (code/hint/label/position/retryable) for the UI to
# show alongside. Protocol unchanged: HTTP 200 and status:"failure".
# The diagnosis hash from RSGenerator.diagnose carries the whole errors
# array and the note, so every mistake of the stage reaches the page.
def diagnosis_json(diagnosis)
  if diagnosis["ok"]
    { status: "success", message: "OK" }.to_json
  else
    first = diagnosis["errors"].first || {}
    { status: "failure",
      message: (first["message"] || "Error: invalid input").gsub("\n", "<br />") }.merge(diagnosis).to_json
  end
end

# Re-ask the input for its full diagnosis. Called only on a failure path —
# drawing has already said no once, so the extra parse costs nothing anyone
# can notice, and the caller gets every error of the stage rather than the
# first one the drawing happened to hit.
def full_diagnosis(params)
  RSyntaxTree::RSGenerator.diagnose(params["data"], params)
end

# A download is a form submission, so the browser navigates to whatever comes
# back. A bare 500 tells the user nothing and leaves no trace they can reach,
# which is how three broken Download buttons went unnoticed until somebody
# wrote in about one of them. Say what went wrong — all of it, one block per
# error, with the note when the diagnosis carries one.
def download_failure(e, params)
  content_type "text/plain; charset=utf-8"
  if e.is_a?(RSTError)
    # The input or the options were wrong, which is the caller's to fix — 400,
    # not 500. A 500 here said the server had broken, and sent anyone reading
    # the logs looking in the wrong place.
    status 400
    diagnosis = full_diagnosis(params)
    return e.message if diagnosis["ok"]

    lines = diagnosis["errors"].map do |err|
      [err["message"], err["hint"]].compact.join("\n→ ")
    end
    lines << diagnosis["note"] if diagnosis["note"]
    lines.join("\n\n")
  else
    status 500
    "Error: the figure could not be generated"
  end
end

post '/check' do
  # Options go with the data: hyphen: literal decides whether a hyphen is
  # an underline, so checking without them rejects input that would draw.
  # diagnose judges the options, the bracket structure, every label, and
  # the whole-tree checks in stages, and reports every error of the stage
  # that fails.
  diagnosis_json(RSyntaxTree::RSGenerator.diagnose(params["data"], params))
rescue StandardError
  { status: "failure", message: "Error: invalid input" }.to_json
end

# make sure the image is generated by really generating it
post '/check_plus' do
  diagnosis = RSyntaxTree::RSGenerator.diagnose(params["data"], params)
  return diagnosis_json(diagnosis) unless diagnosis["ok"]

  rs_generator = RSyntaxTree::RSGenerator.new(params)
  svg = rs_generator.draw_svg
  svg ? { status: "success", message: "OK" }.to_json : raise
rescue RSTError
  # diagnose said the input reads, but the drawing refused it anyway —
  # ask once more so the answer still carries the whole errors array.
  diagnosis_json(full_diagnosis(params))
rescue StandardError
  { status: "failure", message: "Error: invalid input" }.to_json
end

post '/draw_png' do
  basename = "syntree.png"
  rs_generator = RSyntaxTree::RSGenerator.new(params)
  png_blob = rs_generator.draw_png
  response.headers['content_type'] = "image/png"
  response.headers['content_length'] = png_blob.size.to_s
  response.headers['content_disposition'] = "inline" + %(; filename="#{basename}")
  { status: "success", "png" => Base64.encode64(png_blob) }.to_json
rescue RSTError
  diagnosis_json(full_diagnosis(params))
rescue StandardError
  { status: "failure", message: "Error: invalid input" }.to_json
end

post '/draw_svg' do
  basename = "syntree.svg"
  rs_generator = RSyntaxTree::RSGenerator.new(params)
  svg = rs_generator.draw_svg
  response.headers['content_type'] = "image/svg+xml"
  response.headers['content_length'] = svg.size.to_s
  response.headers['content_disposition'] = "inline" + %(; filename="#{basename}")
  { status: "success", svg: Base64.encode64(svg) }.to_json
rescue RSTError
  diagnosis_json(full_diagnosis(params))
rescue StandardError
  { status: "failure", message: "Error: invalid input" }.to_json
end

post '/download_svg' do
  begin
    rs_generator = RSyntaxTree::RSGenerator.new(params)
    svg = rs_generator.draw_svg
  rescue StandardError => e
    return download_failure(e, params)
  end
  content_type 'image/svg+xml'
  attachment 'syntree.svg'
  svg
end

post '/download_png' do
  begin
    rs_generator = RSyntaxTree::RSGenerator.new(params)
    png = rs_generator.draw_png
  rescue StandardError => e
    return download_failure(e, params)
  end
  content_type 'image/png'
  attachment 'syntree.png'
  png
end

post '/download_pdf' do
  begin
    rs_generator = RSyntaxTree::RSGenerator.new(params)
    pdf = rs_generator.draw_pdf
  rescue StandardError => e
    return download_failure(e, params)
  end
  content_type 'application/pdf'
  attachment 'syntree.pdf'
  pdf
end

sample1 = []
sample1 << "[S"
sample1 << "  [NP |R| SyntaxTree]"
sample1 << "  [VP"
sample1 << "    [V generates]"
sample1 << "    [NP"
sample1 << "      [%Adj #\\+multilingual\\"
sample1 << "            \\+beautiful]"
sample1 << "      [NP syntax\\"
sample1 << "          trees]"
sample1 << "    ]"
sample1 << "  ]"
sample1 << "]"

$SAMPLE1 = sample1.join("\n")
