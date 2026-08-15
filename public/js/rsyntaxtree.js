$(function(){

  var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

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
    var EmbedDepth = 0

    var CustomHighlightRules = function() {
      this.$rules = {
        "start" : [
          {
            token : ["text", "string", "text"],
            regex : /(\[)(\S+)(\])/,
            next  : "start"
          },
          {
            token : ["text", "keyword"],
            regex : /(\[)(\S+)/,
            next  : "start"
          },
          {
            token : "text",
            regex : /\]/,
            next : "start"
          },
          {
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

  function make_params(data){
    var params = "data=" + encodeURIComponent(data);
    params = params + "&leafstyle=" +  $("select[name=leafstyle]").val();
    params = params + "&fontstyle=" +  $("select[name=fontstyle]").val();
    params = params + "&fontsize=" +  $("select[name=fontsize]").val();
    params = params + "&vheight=" +  $("select[name=vheight]").val();
    params = params + "&polyline=" +  $("input[name=polyline]:checked").val();
    params = params + "&color=" +  $("select[name=color]").val();
    params = params + "&linewidth=" +  $("select[name=linewidth]").val();
    params = params + "&transparent=" +  $("input[name=transparent]:checked").val();
    params = params + "&hide_default_connectors=" +  $("input[name=hide_default_connectors]:checked").val();
    params = params + "&direction=" +  $("select[name=direction]").val();
    params = params + "&mirror=" +  $("input[name=mirror]:checked").val();
    params = params + "&tidy=" +  $("select[name=tidy]").val();
    params = params + "&hspacing=" +  $("select[name=hspacing]").val();
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

  function postForm(data, format){
    $('<form/>', {action: subdir + '/download_' + format, method: 'POST'})
      .append($('<input/>', {type: 'hidden', name: 'data', value: data}))
      .append($('<input/>', {type: 'hidden', name: 'format', value: $("select[name=format]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'leafstyle', value: $("select[name=leafstyle]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'fontstyle', value: $("select[name=fontstyle]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'fontsize', value: $("select[name=fontsize]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'vheight', value: $("select[name=vheight]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'polyline', value: $("input[name=polyline]:checked").val()}))
      .append($('<input/>', {type: 'hidden', name: 'color', value: $("select[name=color]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'linewidth', value: $("select[name=linewidth]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'hide_default_connectors', value:  $("input[name=hide_default_connectors]:checked").val()}))
      .append($('<input/>', {type: 'hidden', name: 'transparent', value: $("input[name=transparent]:checked").val()}))
      .append($('<input/>', {type: 'hidden', name: 'direction', value: $("select[name=direction]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'mirror', value: $("input[name=mirror]:checked").val()}))
      .append($('<input/>', {type: 'hidden', name: 'tidy', value: $("select[name=tidy]").val()}))
      .append($('<input/>', {type: 'hidden', name: 'hspacing', value: $("select[name=hspacing]").val()}))
      .appendTo(document.body).submit();
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
        alert(res["message"], "danger");
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
        alert(res["message"], "danger");
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
        alert(res["message"], "warning");
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
        alert(res["message"], "warning");
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
        alert(res["message"], "warning");
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
      data:"data=" + escape_chrs(data)
    }).done(function(res){
      if(res["status"] === "failure"){
        alert(res["message"], "warning");
      } else {
        alert("Brackets are balanced", "success");
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
  var settingSelects = ['leafstyle', 'fontstyle', 'fontsize', 'color', 'vheight', 'linewidth', 'direction', 'tidy', 'hspacing'];
  var settingRadios = ['polyline', 'transparent', 'hide_default_connectors', 'mirror'];

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

// Settings panel visibility is part of the saved display settings.
function applySettingsPanel(open) {
  var panel = document.getElementById('settings-panel');
  if (!panel) return;
  panel.hidden = !open;
  $('#toggle-settings').attr('aria-expanded', open ? 'true' : 'false')
    .find('.settings-caret')
    .toggleClass('fa-chevron-up', open)
    .toggleClass('fa-chevron-down', !open);
}

$('#toggle-settings').click(function() {
  var open = document.getElementById('settings-panel').hidden;
  applySettingsPanel(open);
  saveSettings();
});

restoreSettings();

  settingSelects.forEach(function(name) {
    $('select[name=' + name + ']').on('change', saveSettings);
  });
  settingRadios.forEach(function(name) {
    $('input[name=' + name + ']').on('change', saveSettings);
  });
  $('#auto-bracket').on('change', saveSettings);

  $('#reset-settings').click(function() {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (e) {
      // ignore
    }
    location.reload();
  });

});
