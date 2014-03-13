(function(e, a, g, h, f, c, b, d) {
    if (! (f = e.jQuery) || g > f.fn.jquery || h(f)) {
        c = a.createElement("script");
        c.type = "text/javascript";
	try {
	  c.src = chrome.extension.getURL("scripts/jquery.js");
	} catch(e) {
	  console.error(e.toString());
	  c.src = 'https://code.jquery.com/jquery-' + g + '.min.js';
	}
        c.onload = c.onreadystatechange = function() {
            if (!b && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
                h((f = e.jQuery).noConflict(1), b = 1);
                f(c).remove()
            }
        };
        // a.documentElement.childNodes[0].appendChild(c)
        a.body.appendChild(c)
    }
})(window, document, "1.7.1",
function($, L) {
  if (window.attachEvent == undefined) {
    window.onmessage = function(e) {
      __nir_handle_message(e);
    };
  } else {
    window.attachEvent('onmessage', function(e) {
      __nir_handle_message(e);
    });
  }

  window.__nir_handle_message = function(e) {
    if (e.origin != window.location.protocol + "//" + bookmarklet_host()) return
    
    var data = e.data
    
    if (data == "remove_sharebox") window.__remove_sharebox()
    if (data == "hide_sharebox") window.__hide_sharebox()
  }
  
  var get_selection_html = function() {
    if (document.selection) {
      var c = document.selection.createRange();
      return c.htmlText;
    }
    
    var nNd = document.createElement("div");
    var sel = getSelection();
    if (sel == null) return '';
    try {
      var w = getSelection().getRangeAt(0).cloneContents();
      nNd.appendChild(w);
      
      $(nNd).find(".twitter-tweet").each(function(index, element) {
        var tweetUrl = $("#" + element.id).contents().find(".tweet").last().attr("cite")
        
        if (tweetUrl) {
          $(this).replaceWith('<blockquote class="twitter-tweet"><a href="' + tweetUrl + '"></a></blockquote>')
        }
      });
      
      return nNd.innerHTML;
    } catch (e) { return '' }
  }
  
  var sharebox_id = "__nir-sharebox"

  var bookmarklet_host = function() {
    return (window.__nir_bookmarklet_host ? window.__nir_bookmarklet_host : 'www.reader2000.com');
  }
  
  window.__remove_sharebox = function() {
    $("#"+ sharebox_id).remove()
  }
  
  window.__hide_sharebox = function() {
    $("#"+ sharebox_id).hide()
  }
  
  window.__nir_get_info_from_parent = function() {
    $("#"+ sharebox_id).find("iframe").css('border', 0);
    var selection_html = get_selection_html()
    var full_html = $("body").html()
    
    var win = $("#"+ sharebox_id).find("iframe")[0].contentWindow
    
    var title = document.title
    var source_url = document.URL
    
    if (/www\.google\.[^/]+\/reader/.test(document.location) && typeof(window.getPermalink) == 'function') {
      var l = window.getPermalink();
      if (! l) { alert('Open an item first'); window.__remove_sharebox(); throw(0); }
      title = l.title;
      source_url = l.url;
      
      if ($.trim(selection_html) === '') {
        selection_html = $("#current-entry .item-body > div").html()
      }
    } else if (/cloud\.feedly\.com\//.test(document.location)) {
      var $item = $(".selectedEntry")
      
      if (!$item.get(0)) {
        // seems like sometimes selectedEntry doesn't exist, but inlineFrame does...
        $item = $(".inlineFrame")
      }
      
      if (!$item.get(0)) {
        alert("Open an item first!"); window.__remove_sharebox(); throw(0);
      }
      
      var $header = $item.find(".entryHolder .entryTitle")
      
      var div = document.createElement(div);
      div.innerHTML = $header.html();
      title = div.firstChild.nodeValue;
      
      source_url = $header.attr("href")
      
      if ($.trim(selection_html) === '') {
        selection_html = $item.find(".entryBody > .content").html()
      }
    } else if (/newsblur\.com\//.test(document.location)) {
      var $item = $(".NB-feed-story.NB-selected, div.NB-feed-story:has(.NB-feed-story-content)");
      
      if (!$item.get(0)) { alert("Open an item first!"); window.__remove_sharebox(); throw(0); }
      
      var $header = $item.find(".NB-feed-story-title")
      
      var div = document.createElement(div);
      div.innerHTML = $header.html();
      title = div.firstChild.nodeValue;
      
      source_url = $header.attr("href")
      
      if ($.trim(selection_html) === '') {
        selection_html = $item.find(".NB-feed-story-content").html()
      }
    } else if (/digg\.com\/reader/.test(document.location)) {
      var $item = $(".feeditem-list.expanded")
      
      if (!$item.get(0)) { alert("Open an item first!"); window.__remove_sharebox(); throw(0); }
      
      var $header = $item.find(".story-title > a")
      
      var div = document.createElement(div);
      div.innerHTML = $header.html();
      title = div.firstChild.nodeValue;
      
      source_url = $header.attr("href")
      
      if ($.trim(selection_html) === '') {
        selection_html = $item.find(".detail-body").html()
      }
    }
    
    var payload = {
    'originator': 'r2k',
    'title' : title,
    'selection' : selection_html,
    'full_html' : full_html,
    'source_url' : source_url,
    'domain' : window.location.protocol + "//" + window.location.hostname
    }
    
    var target = window.location.protocol + "//" + bookmarklet_host();
    
    win.postMessage(payload, target)
  }
  
  var show_sharebox = function() {
    if (!bookmarklet_host().match(/^www/i) && bookmarklet_host() !== "reader2000.fwd.wf") {
      alert("Sorry (Lo siento... / متاسف...)!!!! But you've gotta go back to R2K and reinstall your bookmarklet. If you already did that and are STILLLLL having problems, hit up feedback@reader2000.com and we'll hook you up")
      return false
    }
    
    window.__remove_sharebox()
    $box = $("<div>", {"id" : sharebox_id, "style" : 'background-color: white;height:495px; position: fixed; right: 8px; top: 8px; width: 520px; z-index:2147483647;' })
    
    var html = " \
      <iframe onload='__nir_get_info_from_parent()' style='border:4px solid black;width:100%; height:100%; background-image: url(" + window.location.protocol + "//" + bookmarklet_host() + "/images/large_throbber.gif);background-repeat: no-repeat;background-position: 50% 50%;' src='" + window.location.protocol + "//" + bookmarklet_host() +"/shares/new?bookmarklet=true'></iframe>"
    $box.html(html)
    $box.appendTo('body')
  }
  
  show_sharebox()
});
