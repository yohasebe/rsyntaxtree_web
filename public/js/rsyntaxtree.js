$(function(){

  var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

  // The drawing options, named once. Three places used to carry their own copy
  // of this list — the serialiser, the download form and the settings store —
  // and keeping three lists in step with the page is what failed: a `format`
  // select was taken out of the page and the download form went on reading it,
  // so every Download button sent an empty value and answered 500. One list,
  // and adding or removing a control is one edit.
  var optionSelects = ['leafstyle', 'fontstyle', 'fontsize', 'color', 'vheight',
                       'linewidth', 'direction', 'tidy', 'hspacing', 'hyphen'];
  var optionRadios = ['polyline', 'transparent', 'hide_default_connectors',
                      'mirror', 'derivation'];

  // What a control says, or undefined if the page has no such control and for a
  // radio group with nothing checked. Every caller below skips those rather
  // than sending them: an option nobody chose is one the server should default,
  // and written into a query string an undefined becomes the literal text
  // "undefined", which no amount of leniency at the far end can read.
  function optionValue(name, isRadio) {
    var value = isRadio ? $("input[name=" + name + "]:checked").val()
                        : $("select[name=" + name + "]").val();
    return (value === undefined || value === null || value === "") ? undefined : value;
  }

  function eachOption(fn) {
    optionSelects.forEach(function(name){ fn(name, optionValue(name, false)); });
    optionRadios.forEach(function(name){ fn(name, optionValue(name, true)); });
  }

  //////////////////// Setup Ace Syntax ///////////////
  define('ace/mode/custom', [], function(_require, exports, _module) {
    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    // var Tokenizer = require("ace/tokenizer").Tokenizer;
    var CustomHighlightRules = require("ace/mode/custom_highlight_rules").CustomHighlightRules;
    var CstyleBehaviour = require("ace/mode/behaviour/cstyle").CstyleBehaviour;
    var Mode = function() {
      this.HighlightRules = CustomHighlightRules;
      this.$behaviour = new CstyleBehaviour();
    };
    oop.inherits(Mode, TextMode);
    (function() {
    }).call(Mode.prototype);
    exports.Mode = Mode;
  });

  define('ace/mode/custom_highlight_rules', [], function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    // Structure only. The notation has a dozen kinds of markup inside a label
    // and none of them are recognised here on purpose: a second reading of the
    // grammar drifts from the one that draws, and a highlighter drifts
    // silently. What is coloured is what can be known without reading markup —
    // where a node opens and closes, and where its label runs.
    //
    // A label runs from the bracket to the first real space. Newlines and
    // columns are written \n and \t, two characters rather than whitespace,
    // so a feature matrix is one long label and is coloured as one.
    var CustomHighlightRules = function() {
      this.$rules = {
        "start" : [
          {
            // An escape is two characters and neither is structure. Taken
            // first so that \[ and \] are not read as brackets: six gallery
            // examples write phonological features that way.
            token : "text",
            regex : /\\[\s\S]/,
            next  : "start"
          },
          {
            token : ["paren.lparen", "keyword"],
            regex : /(\[)((?:\\[\s\S]|[^\s\[\]\\])+)/,
            next  : "start"
          },
          {
            token : "paren.lparen",
            regex : /\[/,
            next  : "start"
          },
          {
            token : "paren.rparen",
            regex : /\]/,
            next  : "start"
          },
          {
            // Leaf text keeps the colour it had. The change here is what is
            // no longer claimed about it, not how it looks.
            defaultToken: "string",
            next : "start"
          }
        ],
      };
      this.normalizeRules();
    };
    oop.inherits(CustomHighlightRules, TextHighlightRules);
    exports.CustomHighlightRules = CustomHighlightRules;
  });

  //////////////////// Setup Ace textarea ///////////////
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/textmate");
  editor.setOption('highlightActiveLine', false);
  editor.session.setMode("ace/mode/custom");
  editor.session.setOption('wrap', true);
  editor.session.setOption('tabSize', 2);
  editor.renderer.setOption('fontSize', 14);
  editor.renderer.setOption('showPrintMargin', false);
  editor.setAutoScrollEditorIntoView(true);
  if(isMobile){
    editor.renderer.setOption('showGutter', false);
    editor.setOption('showLineNumbers', false);
  } else {
    editor.renderer.setOption('showGutter', true);
    editor.setOption('showLineNumbers', true);
  }

  process_finished();
  var subdir = $('#top').data('subdir');

  var waiting = $("<span class='text text-info'>●</span> <span class='alertmessage'></span>")

  var timerID
  function alert(msg, type){
    if(timerID){
      clearInterval(timerID);
    }
    $("#alert").empty();
    var alert_message = $("<span class='text text-" + type + "'>●</span> <span style='font-size: 0.9em; font-family: Menlo, Monaco, Consolas, monospace; font-weight:regular; color:white;'>" + msg +"</span>");
    $("#alert").append(alert_message);

    timerID = setTimeout(function(){
      $("#alert").html(waiting);
    },15000);
  }

  // A failure response carries the structured diagnosis alongside the
  // message; show the one-line fix when the server sent one.
  function failure_message(res){
    var msg = res["message"];
    if(res["errors"] && res["errors"][0] && res["errors"][0]["hint"]){
      msg += "<br />→ " + res["errors"][0]["hint"];
    }
    return msg;
  }

  // Ask the library where the input is wrong, once typing stops. The
  // highlighter above knows nothing about markup on purpose, so this is where
  // a mistake inside a label becomes visible, and it comes from the parser
  // that draws rather than from a second reading of the notation.
  //
  // Shown in the gutter rather than as a message: it fires while the input is
  // still being written, and half-written input is wrong most of the time.
  var live_check_timer, live_check_last;

  function mark_diagnosis(res){
    if(res["status"] !== "failure"){
      editor.session.clearAnnotations();
      return;
    }
    var err = (res["errors"] || [])[0] || {};
    // The cause and the fix, and nothing else. The answer also carries where
    // the notation is written down, which is for a caller driving this over
    // the API; it names a command line and a file meant for a language model,
    // neither of which helps someone reading a tooltip in a browser. The
    // links under the editor are where a reader goes.
    var text = (err["message"] || res["message"] || "").replace(/<br \/>/g, "\n");
    if(err["hint"]){ text += "\n\n" + err["hint"]; }

    editor.session.setAnnotations([{ row: row_of(err), column: 0, text: text, type: "warning" }]);
  }

  // Which line to mark. The label comes back as the parser read it, and a
  // label written over several lines comes back with the breaks as the two
  // characters backslash-n, so it is a substring of no line at all. That is
  // the feature matrix case — the construction most in need of a marker —
  // which would otherwise land on line one every time.
  //
  // So: look for the whole label first, which is right for a label on one
  // line. Failing that, cut the label at its line breaks and look for the
  // piece the reported position falls in.
  function row_of(err){
    var label = err["label"];
    if(!label){ return 0; }
    var lines = editor.getValue().split("\n");

    var whole = find_row(lines, label);
    if(whole !== -1){ return whole; }

    var pieces = [], start = 0, current = "", i = 0;
    while(i < label.length){
      if(label.charAt(i) === "\\" && label.charAt(i + 1) === "n"){
        pieces.push({ start: start, text: current });
        i += 2; start = i; current = "";
      } else {
        current += label.charAt(i); i += 1;
      }
    }
    pieces.push({ start: start, text: current });

    var pos = err["position"] || 0, piece = pieces[0];
    for(var p = 0; p < pieces.length; p++){
      if(pieces[p].start <= pos){ piece = pieces[p]; }
    }
    var row = find_row(lines, piece.text);
    return row === -1 ? 0 : row;
  }

  function find_row(lines, needle){
    if(!needle){ return -1; }
    for(var i = 0; i < lines.length; i++){
      if(lines[i].indexOf(needle) !== -1){ return i; }
    }
    return -1;
  }

  function live_check(){
    // The marker lives in the gutter, which is off on a small screen. Asking
    // would cost the request and show nothing; there the Check button is the
    // way in.
    if(isMobile){ return; }
    var data = editor.getValue();
    if(data.replace(/\s/g, "") === ""){
      editor.session.clearAnnotations();
      return;
    }
    if(data === live_check_last){ return; }
    live_check_last = data;
    $.ajax({
      type: "POST",
      dataType: "json",
      url: subdir + "/check",
      data: make_params(escape_chrs(data))
    }).done(function(res){
      // Answers can arrive out of order: a check queues behind a drawing
      // request, and a slow answer about text that has since been edited
      // would otherwise overwrite a newer one.
      if(data !== editor.getValue()){ return; }
      mark_diagnosis(res);
    }).fail(function(){
      // Let the same text be asked about again.
      live_check_last = null;
    });
  }

  editor.session.on("change", function(){
    if(live_check_timer){ clearTimeout(live_check_timer); }
    live_check_timer = setTimeout(live_check, 700);
  });

  function make_params(data){
    var params = "data=" + encodeURIComponent(data);
    eachOption(function(name, value){
      if(value === undefined) return;
      params = params + "&" + name + "=" + encodeURIComponent(value);
    });
    return params;
  }

  function process_started(){
    $("button.draw").attr("disabled", "disabled")
    $("#result").resizable('destroy');
    alert("Please wait ...", "warning");
  }

  function process_finished(){
    $("button.draw").removeAttr('disabled');
    $("#result").resizable( {handles:"se", grid: [10000000,1] }).on('resize', function(){});
  }

  function draw_graph(data, format){
    process_started()
    if(format == "svg"){
      $.ajax({
        url: subdir + '/draw_svg',
        type: 'POST',
        dataType: 'json',
        data: make_params(data)
      }).done(function (data) {
        if(data["status"] === "success"){
          var svg_data = data["svg"]
          $("#result").empty();
          var svg_img = 'data:image/svg+xml;base64, ' + svg_data;
          var img = new Image();
          img.src = svg_img;
          var width; var height;

          var result = $(img).attr("id", "tree_image");
          var anchor = $("<a href='" + svg_img + "' data-lightbox='syntree'>")
          anchor.append(result);
          $("#result").append(anchor);

          process_finished();
          alert("Syntree generated successfully", "success");
          $('body, html').animate({ scrollTop: top}, 500)
        } else {
          var message = data["message"];
          process_finished();
          alert(message, "warning");
          $('body, html').animate({ scrollTop: top}, 500)
        }
      }).fail(function(){
        process_finished();
        alert("Error: Something unexpected occurred", "danger");
        $('body, html').animate({ scrollTop: top}, 500)
      });
    } else {
      $.ajax({
        url: subdir + '/draw_png',
        type: 'POST',
        dataType: 'json',
        data: make_params(data)
      }).done(function (data) {
        if(data["status"] === "success"){
          var raw_data = data["png"]
          $("#result").empty();
          var png_img = 'data:image/png;base64, ' + raw_data;
          var img = new Image();
          img.src = png_img;
          var width; var height;

          var result = $(img).attr("id", "tree_image");
          var anchor = $("<a href='" + png_img + "' data-lightbox='syntree'>")
          anchor.append(result);
          $("#result").append(anchor);

          process_finished();
          alert("Syntree generated successfully", "success");
          $('body, html').animate({ scrollTop: top}, 500)
        } else {
          var message = data["message"];
          process_finished();
          alert(message, "danger");
          $('body, html').animate({ scrollTop: top }, 500)
        }
      }).fail(function(jqXHR, textStatus, errorThrown){
        process_finished();
        alert("Error: Something unexpected occurred", "danger");
        $('body, html').animate({ scrollTop: top}, 500)
      });
    }
  }

  function escape_chrs(data){
    data = data.replace(/\&/g, "-AMP-")
      .replace(/\%/g, '-PERCENT-')
      .replace(/\'/g, "-PRIME-")
      .replace(/\;/g, "-SCOLON-")
      .replace(/\</g, "-OABRACKET-")
      .replace(/\>/g, "-CABRACKET-");
    data = $('<div/>').text(data).html();
    return data;
  }

  // One field per control that is actually on the page. This used to be a
  // written-out list of fields, one of which — format — read a select that had
  // since been taken out of the page. jQuery sends such a field anyway, empty,
  // and an empty value is not one the library accepts: every Download button
  // answered 500 for every input, and the reason never reached the user.
  // Building the form from what is there cannot outlive a control again, and
  // it covers the radio groups too, which read empty when nothing is checked.
  function postForm(data, format){
    var form = $('<form/>', {action: subdir + '/download_' + format, method: 'POST'})
      .append($('<input/>', {type: 'hidden', name: 'data', value: data}));
    eachOption(function(name, value){
      if(value === undefined) return;
      form.append($('<input/>', {type: 'hidden', name: name, value: value}));
    });
    form.appendTo(document.body).submit();
  }


  $("#draw_png").click(function(){
    $("#alert").empty();
    var data = editor.getValue();
    data = escape_chrs(data);
    $.ajax({
      type: "POST",
      dataType: 'json',
      url: subdir + "/check",
      data: make_params(data)
    }).done(function(res){
      if(res["status"] === "failure"){
        alert(failure_message(res), "danger");
        $('body, html').animate({ scrollTop: top}, 500)
      } else {
        if($("input[name=transparent]:checked").val()){
          $("#result").css("background-color", "transparent")
        } else {
          $("#result").css("background-color", "white")
        }
        draw_graph(data, "png");
      }
    }).fail(function(){
      process_finished();
      alert("Error: Unexpected type of input", "danger");
    });
  });

  $("#draw_svg").click(function(){
    $("#alert").empty();
    var data = editor.getValue();
    data = escape_chrs(data);
    $.ajax({
      type: "POST",
      dataType: 'json',
      url: subdir + "/check",
      data: make_params(data)
    }).done(function(res){
      if(res["status"] === "failure"){
        alert(failure_message(res), "danger");
        $('body, html').animate({ scrollTop: top}, 500)
      } else {
        if($("input[name=transparent]:checked").val()){
          $("#result").css("background-color", "transparent")
        } else {
          $("#result").css("background-color", "white")
        }
        draw_graph(data, "svg");
      }
    }).fail(function(){
      process_finished();
      alert("Error: Something unexpected occurred", "danger");
      $('body, html').animate({ scrollTop: top}, 500)
    });
  });

  $("#download_png").click(function(){
    $("#alert").empty();
    var data = editor.getValue();
    data = escape_chrs(data);
    $.ajax({
      type: "POST",
      dataType: 'json',
      url: subdir + "/check_plus",
      data: make_params(data)
    }).done(function(res){
      if(res["status"] === "failure"){
        alert(failure_message(res), "warning");
        $('body, html').animate({ scrollTop: top}, 500)
      } else {
        alert("Syntree generated successfully", "success");
        postForm(data, "png");
      }
    }).fail(function(){
      process_finished();
      alert("Error: Something unexpected occurred", "danger");
      $('body, html').animate({ scrollTop: top}, 500)
    });
  });

  $("#download_svg").click(function(){
    $("#alert").empty();
    var data = editor.getValue();
    data = escape_chrs(data);
    $.ajax({
      type: "POST",
      dataType: 'json',
      url: subdir + "/check_plus",
      data: make_params(data)
    }).done(function(res){
      if(res["status"] === "failure"){
        alert(failure_message(res), "warning");
        $('body, html').animate({ scrollTop: top}, 500)
      } else {
        alert("Syntree generated successfully", "success");
        postForm(data, "svg");
      }
    }).fail(function(){
      process_finished();
      alert("Error: Something unexpected occurrred", "danger");
      $('body, html').animate({ scrollTop: top}, 500)
    });
  });

  $("#download_pdf").click(function(){
    $("#alert").empty();
    var data = editor.getValue();
    data = escape_chrs(data);
    $.ajax({
      type: "POST",
      dataType: 'json',
      url: subdir + "/check_plus",
      data: make_params(data)
    }).done(function(res){
      if(res["status"] === "failure"){
        alert(failure_message(res), "warning");
        $('body, html').animate({ scrollTop: top}, 500)
      } else {
        alert("Syntree generated successfully", "success");
        postForm(data, "pdf");
      }
    }).fail(function(){
      process_finished();
      alert("Error: Something unexpected occurrred", "danger");
      $('body, html').animate({ scrollTop: top}, 500)
    });
  });

  $("#check").click(function(){
    var data = editor.getValue();
    $.ajax({
      type: "POST",
      dataType: 'json',
      url: subdir + "/check",
      data: make_params(escape_chrs(data))
    }).done(function(res){
      if(res["status"] === "failure"){
        alert(failure_message(res), "warning");
      } else {
        alert("The input parses", "success");
      }
    }).fail(function(){
      process_finished();
      alert("Error: Something unexpected occurred", "danger");
    });
  });

  $("#clear").click(function(){
    var data = editor.setValue("");
    $("#alert").empty();
  });
  editor.focus();

  $("#editor").resizable( {handles:"se", grid: [10000000,1] }).on('resize', function(){
    editor.resize();
  });

  $("#result").resizable( {handles:"se", grid: [10000000,1] }).on('resize', function(){});


  //////////////////// Scroll to top ///////////////
  $(document).on('scroll', function(){
    if ($(window).scrollTop() > 100) {
      $('.ctrl-wrapper.scroll-top').addClass('show');
    } else {
      $('.ctrl-wrapper.scroll-top').removeClass('show');
    }
  });
  $('#to-top').click(function(){
    $("html, body").animate({ scrollTop: $('body').offset().top }, 40);
  });

  $(document).click(function (event) {
      var clickover = $(event.target);
      var _opened = $(".navbar-collapse").hasClass("show");
      if (_opened === true && !clickover.hasClass("navbar-toggler")) {
          $(".navbar-toggler").click();
      }
  });

  // manual carousel contros
  $('.next').click(function(){ $('.carousel').carousel('next');return false; });
  $('.prev').click(function(){ $('.carousel').carousel('prev');return false; });

  $('.carousel').carousel({
    interval: 12000
  })
  var items = $('.carousel-inner .carousel-item');
  var index = Math.floor(Math.random() * items.length);
  var index = Math.floor(Math.random() * items.length);
  items.removeClass('active').eq(index).addClass('active');
  items.eq(index).addClass('active');

  editor.setBehavioursEnabled(false);

  $('#auto-bracket').click(function(){
    if($("#auto-bracket").prop('checked')) {
      editor.setBehavioursEnabled(true);
    }
    else {
      editor.setBehavioursEnabled(false);
    }
  })

  lightbox.option({
    'resizeDuration': 200,
  })

  // Insert character at cursor position
  function insertAtCursor(text) {
    editor.session.insert(editor.getCursorPosition(), text);
    editor.focus();
  }

  // Backslash and bar insert buttons
  $("#insert-backslash").click(function(){
    insertAtCursor('\\');
  });

  $("#insert-bar").click(function(){
    insertAtCursor('|');
  });

  // IPA Keyboard toggle
  $("#toggle-ipa-keyboard").click(function(){
    $("#ipa-keyboard-panel").slideToggle();
  });

  // IPA symbols data
  var ipaSymbols = {
    vowels: {
      "Close": ['i', 'y', 'ɨ', 'ʉ', 'ɯ', 'u'],
      "Near-close": ['ɪ', 'ʏ', 'ʊ'],
      "Close-mid": ['e', 'ø', 'ɘ', 'ɵ', 'ɤ', 'o'],
      "Mid": ['ə'],
      "Open-mid": ['ɛ', 'œ', 'ɜ', 'ɞ', 'ʌ', 'ɔ'],
      "Near-open": ['æ', 'ɐ'],
      "Open": ['a', 'ɶ', 'ä', 'ɑ', 'ɒ']
    },
    consonants: {
      "Plosive": ['p', 'b', 't', 'd', 'ʈ', 'ɖ', 'c', 'ɟ', 'k', 'g', 'q', 'ɢ', 'ʔ', 'ʡ'],
      "Nasal": ['m', 'ɱ', 'n', 'ɳ', 'ɲ', 'ŋ', 'ɴ'],
      "Trill": ['ʙ', 'r', 'ʀ'],
      "Tap/Flap": ['ⱱ', 'ɾ', 'ɽ', 'ɺ'],
      "Fricative": ['ɸ', 'β', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'ʂ', 'ʐ', 'ç', 'ʝ', 'x', 'ɣ', 'χ', 'ʁ', 'ħ', 'ʕ', 'ʜ', 'ʢ', 'h', 'ɦ', 'ɧ'],
      "Lateral fricative": ['ɬ', 'ɮ'],
      "Approximant": ['ʋ', 'ɹ', 'ɻ', 'j', 'ɰ', 'w', 'ɥ', 'ʍ'],
      "Lateral approximant": ['l', 'ɭ', 'ʎ', 'ʟ', 'ɫ'],
      "Clicks": ['ʘ', 'ǀ', 'ǃ', 'ǂ', 'ǁ'],
      "Voiced implosives": ['ɓ', 'ɗ', 'ʄ', 'ɠ', 'ʛ'],
      "Ejectives": ['pʼ', 'tʼ', 'kʼ', 'sʼ', 'qʼ', 'tʃʼ', 'tsʼ', 'tɬʼ', 'cʼ', 'ʃʼ', 'xʼ', 'χʼ']
    },
    diacritics: {
      "Syllabicity": ['̩', '̯'],
      "Release": ['ʰ', '̚', 'ⁿ', 'ˡ', '̊'],
      "Phonation": ['̥', '̬', '̤', '̰', '̼', '̊'],
      "Articulation": ['̪', '̺', '̻', '̟', '̠', '̈', '̽', '̝', '̞', '̘', '̙', '̹', '̜'],
      "Co-articulation": ['ʷ', 'ʲ', 'ˠ', 'ˤ', '̴', '̃', '˞'],
      "Timing": ['̆', '̄', 'ː', 'ˑ']
    },
    suprasegmentals: {
      "Stress": ['ˈ', 'ˌ', 'ˈˈ'],
      "Length": ['ː', 'ˑ', '̆'],
      "Intonation": ['|', '‖', '.', '‿', '↗', '↘'],
      "Tone (Level)": ['˥', '˦', '˧', '˨', '˩'],
      "Tone (Contour)": ['˩˥', '˥˩', '˧˥', '˩˧', '˧˩˧', '˦˥', '˧˦', '˨˧', '˩˨'],
      "Tone (Diacritics)": ['̋', '́', '̄', '̀', '̏', '̌', '̂'],
      "Prosody": ['↑', '↓', '!', '|', '‖']
    }
  };

  // Build IPA keyboard panels
  function buildIPAPanel(category, symbols) {
    var html = '<div class="ipa-category-container">';
    
    for (var subcategory in symbols) {
      if (symbols.hasOwnProperty(subcategory)) {
        var chars = symbols[subcategory];
        html += '<div class="ipa-subcategory">';
        html += '<h6 class="ipa-subcategory-title">' + subcategory + '</h6>';
        html += '<div class="ipa-button-group">';
        
        chars.forEach(function(char) {
          html += '<button type="button" class="btn btn-sm btn-outline-secondary ipa-char-btn" data-char="' + char + '">' + char + '</button>';
        });
        
        html += '</div></div>';
      }
    }
    
    html += '</div>';
    return html;
  }

  // Initialize IPA keyboard panels
  $('#vowels').html(buildIPAPanel('vowels', ipaSymbols.vowels));
  $('#consonants').html(buildIPAPanel('consonants', ipaSymbols.consonants));
  $('#diacritics').html(buildIPAPanel('diacritics', ipaSymbols.diacritics));
  $('#suprasegmentals').html(buildIPAPanel('suprasegmentals', ipaSymbols.suprasegmentals));

  // IPA character button click handler
  $(document).on('click', '.ipa-char-btn', function() {
    var char = $(this).data('char');
    insertAtCursor(char);
  });

  // ------------------------------------------------------------------
  // Persist display settings across sessions using localStorage.
  // Only the settings are stored; the text in the editor is never saved.
  var SETTINGS_KEY = 'rsyntaxtree-settings';
  // The same list the serialiser and the download form read.
  var settingSelects = optionSelects;
  var settingRadios = optionRadios;

  function saveSettings() {
    var settings = {};
    settingSelects.forEach(function(name) {
      var val = $('select[name=' + name + ']').val();
      if (val !== undefined && val !== null) settings[name] = val;
    });
    settingRadios.forEach(function(name) {
      var val = $('input[name=' + name + ']:checked').val();
      if (val !== undefined) settings[name] = val;
    });
    settings['auto_bracket'] = $('#auto-bracket').prop('checked');
    settings['settings_open'] = !document.getElementById('settings-panel').hidden;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      // Storage unavailable (private browsing etc.); silently skip
    }
  }

  function restoreSettings() {
    var raw = null;
    try {
      raw = localStorage.getItem(SETTINGS_KEY);
    } catch (e) {
      return;
    }
    if (!raw) return;
    var settings;
    try {
      settings = JSON.parse(raw);
    } catch (e) {
      return;
    }

    settingSelects.forEach(function(name) {
      if (settings[name] === undefined) return;
      var $sel = $('select[name=' + name + ']');
      if ($sel.find('option[value="' + settings[name] + '"]').length) {
        $sel.val(settings[name]);
      }
    });
    settingRadios.forEach(function(name) {
      if (settings[name] === undefined) return;
      var $radio = $('input[name=' + name + '][value="' + settings[name] + '"]');
      if ($radio.length) {
        // Sync the checked ATTRIBUTE as well as the property: Bootstrap's
        // button plugin re-derives the active classes on window load from
        // `input.checked || input.hasAttribute('checked')`, so a stale
        // attribute on the default radio would mark both buttons active.
        $radio.closest('.btn-group').find('input')
              .prop('checked', false).removeAttr('checked');
        $radio.prop('checked', true).attr('checked', 'checked');
        $radio.closest('label').addClass('active')
              .siblings('label').removeClass('active');
      }
    });
    if (settings['settings_open'] === false) applySettingsPanel(false);
    if (settings['auto_bracket'] === true) {
      $('#auto-bracket').prop('checked', true);
      editor.setBehavioursEnabled(true);
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

// Where the page must scroll for the whole settings area (toggle bar plus
// panel) to be visible; null when it already is. Call this only while the
// panel occupies its full height, or the target will fall short.
function settingsScrollTarget() {
  var bar = document.querySelector('.settings-bar');
  var area = (bar && bar.parentElement) || document.getElementById('settings-panel');
  if (!area) return null;
  var rect = area.getBoundingClientRect();
  var viewTop = window.pageYOffset;
  var top = rect.top + viewTop;
  var bottom = top + rect.height;
  if (top >= viewTop && bottom <= viewTop + window.innerHeight) return null;
  // Move the least: bring the bottom into view without scrolling past the
  // top (which matters when the area is taller than the viewport).
  return Math.min(top, Math.max(0, bottom - window.innerHeight));
}

// Animating 'html, body' would run the completion callback once per
// element; scroll the single scrolling element instead.
function scrollToSettings(target, animated, done) {
  if (target === null) {
    if (done) done();
    return;
  }
  if (animated) {
    var scroller = document.scrollingElement || document.documentElement;
    $(scroller).stop(true).animate({ scrollTop: target }, 400, done);
  } else {
    window.scrollTo(0, target);
    if (done) done();
  }
}

// Settings panel visibility is part of the saved display settings.
//
// Opening is ordered so the reader sees it happen: the panel claims its
// space first, the page scrolls to it, and only then does the reveal
// animate. Animating first would play the whole thing below the fold.
// With motion allowed the scroll runs alongside the slide, so the page
// follows the unfolding panel; readers who ask for reduced motion get an
// immediate scroll followed by a fade, which involves no movement.
function applySettingsPanel(open, animate) {
  var $panel = $('#settings-panel');
  var panel = $panel[0];
  if (!panel) return;
  var reduced = prefersReducedMotion();
  var duration = animate ? 400 : 0;
  $panel.stop(true, true);

  if (open) {
    panel.hidden = false;
    if (!animate) {
      $panel.css({ display: '', opacity: '' });
    } else if (reduced) {
      // Claim the space invisibly, jump to it, then fade in place.
      $panel.css({ opacity: 0 }).show();
      scrollToSettings(settingsScrollTarget(), false);
      $panel.animate({ opacity: 1 }, duration, function () {
        $panel.css({ display: '', opacity: '' });
      });
    } else {
      // Measure the final height to aim the scroll, then slide and scroll
      // together so the panel unfolds into view.
      $panel.css({ visibility: 'hidden' }).show();
      var target = settingsScrollTarget();
      $panel.hide().css({ visibility: '' });
      scrollToSettings(target, true);
      $panel.slideDown(duration, function () {
        $panel.css({ display: '', opacity: '' });
      });
    }
  } else {
    var collapse = function () {
      $panel[reduced ? 'fadeOut' : 'slideUp'](duration, function () {
        $panel.css({ display: '', opacity: '' });
        panel.hidden = true;
      });
    };
    // Closing has the same problem as opening, in reverse: a panel below
    // the fold collapses out of sight. Bring it into view first, then
    // animate it away. The panel is still at full height here, so the
    // scroll target is the right one.
    if (animate) {
      scrollToSettings(settingsScrollTarget(), !reduced, collapse);
    } else {
      collapse();
    }
  }

  $('#toggle-settings').attr('aria-expanded', open ? 'true' : 'false')
    .find('.settings-caret')
    .toggleClass('fa-chevron-up', open)
    .toggleClass('fa-chevron-down', !open);
}

$('#toggle-settings').click(function () {
  applySettingsPanel(document.getElementById('settings-panel').hidden, true);
  saveSettings();
});

// What the page ships with, taken before anything saved is applied.
// restoreSettings rewrites the checked attribute on the radios, so once it has
// run the markup no longer says what the defaults were.
var SETTINGS_DEFAULTS = (function() {
  var panel = document.getElementById('settings-panel');
  var defaults = { settings_open: panel ? !panel.hidden : true };
  settingSelects.forEach(function(name) {
    defaults[name] = $('select[name=' + name + ']').val();
  });
  settingRadios.forEach(function(name) {
    defaults[name] = $('input[name=' + name + ']:checked').val();
  });
  defaults['auto_bracket'] = $('#auto-bracket').prop('checked');
  return defaults;
})();

restoreSettings();

  settingSelects.forEach(function(name) {
    $('select[name=' + name + ']').on('change', saveSettings);
  });
  settingRadios.forEach(function(name) {
    $('input[name=' + name + ']').on('change', saveSettings);
  });
  $('#auto-bracket').on('change', saveSettings);

  // Put the controls back where they started. This used to reload the page,
  // which also emptied the editor back to the sample: resetting the settings
  // is not a reason to lose the tree someone is in the middle of writing.
  $('#reset-settings').click(function() {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (e) {
      // ignore
    }

    settingSelects.forEach(function(name) {
      $('select[name=' + name + ']').val(SETTINGS_DEFAULTS[name]);
    });
    settingRadios.forEach(function(name) {
      var $group = $('input[name=' + name + ']');
      $group.prop('checked', false).removeAttr('checked')
            .closest('label').removeClass('active');
      $group.filter('[value="' + SETTINGS_DEFAULTS[name] + '"]')
            .prop('checked', true).attr('checked', 'checked')
            .closest('label').addClass('active');
    });
    $('#auto-bracket').prop('checked', SETTINGS_DEFAULTS['auto_bracket']);
    editor.setBehavioursEnabled(SETTINGS_DEFAULTS['auto_bracket']);
    applySettingsPanel(SETTINGS_DEFAULTS['settings_open'], false);

    // The controls now hold the defaults, so record that rather than leaving
    // the next change to write a half-reset state.
    saveSettings();
    alert("Settings reset", "success");
  });

});
