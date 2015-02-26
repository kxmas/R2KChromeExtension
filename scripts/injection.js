/**
 * passed parameters:
 * e = window,
 * a = document,
 * g = jquery version,
 * h = function block
 *
 * assigned parameters:
 * f = jquery
 * c = script element (to load jquery)
 * b = boolean (passed to h, but not used...)
 */
(function (window, callback) {
    var jq = jQuery.noConflict();
    callback(window, jq);
})(window, function (window, $) {
    console.debug("running injection.js");

    var get_selection_html = function () {
        if (document.selection) {
            var c = document.selection.createRange();
            return c.htmlText;
        }

        var nNd = document.createElement("div");
        var sel = getSelection();
        if (sel == null) return '';
        try {
            var w = getSelection().getRangeAt(0).cloneContents();
            filter_doc_fragment(w);
            nNd.appendChild(w);

            $(nNd).find(".twitter-tweet").each(function (index, element) {
                var tweetUrl = $("#" + element.id).contents().find(".tweet").last().attr("cite")

                if (tweetUrl) {
                    $(this).replaceWith('<blockquote class="twitter-tweet"><a href="' + tweetUrl + '"></a></blockquote>')
                }
            });

            return nNd.innerHTML;
        } catch (exception_var_1) {
            console.error(exception_var_1);
            return ''
        }
    }

    var filter_doc_fragment = function (doc_fragment) {
        try {
            remove_nuisances(doc_fragment);
            remove_hidden_elements(doc_fragment);
        } catch (exception_var_1) {
            console.error(exception_var_1);
        }
    }

    var remove_nuisances = function (doc_fragment) {
        var nuisance_selectors = "script, meta, noscript, figcaption, .photo-caption, .stack-credit-art-figcaption, p[class*='targetCaption'], .clickToPlay, .cnnStryVidCont, .cnn_bulletbin, .cnnStryHghLght, q, .hidden, .instapaper_ignore, .social-media-column, aside, .hide, .wp-caption-text, figure > .credit, .share-tools-container, .tablet-ad, span[class*='mw-editsection'], sup.reference, .noprint, .sharetools, .share-tools, .visually-hidden, div.ad, .ad-placeholder, .sharebar, #sharebar, .social-button, .email-signup, #e_espn_morevideo, .splashRibbon, .m-ad, #follow-bar, .caption-text, .credit, .story-header, .lede-container, .extended-byline, .story-footer, .hoverZoomLink, .share-box, .photo > .caption, .gig-share-bar-container, .a-share, .anno-right, .advertisement";
        var delNodes = doc_fragment.querySelectorAll(nuisance_selectors);
        delete_nodes(delNodes);

        var gawker_nuisance_selectors = "span.magnifier.lightBox, span.image-annotation-footnote-wrapper, .proxima, .meta-container";
        if (isGawkerSite(document.location)) {
            delNodes = doc_fragment.querySelectorAll(gawker_nuisance_selectors);
            delete_nodes(delNodes);
        }

        var wsj_nuisance_selectors = ".article-chiclet, .ticker, .module.inset-box, .datestamp-dsk, .module.shareTools, .zonedModule, .shareTree, .byline-dsk, .module.articleHeadgroup, .module.trendingNow, .scrimWSJ_overlay, .module.editors-picks, #commentFormContainer, .module.deskfoot, .targetCaption-video, .i-credit, .module.rich-media-inset-iframe, .v-assett, .insettipBox, .cxense, .wp-caption-dd, wp-cite-dd";
        if (isWSJ(document.location)) {
            delNodes = doc_fragment.querySelectorAll(wsj_nuisance_selectors);
            delete_nodes(delNodes);
        }
    }

    var none_display_node_filter = function (node) {
        try {
            if (node.style && node.style.display === "none") {
                return NodeFilter.FILTER_ACCEPT;
            } else {
                return NodeFilter.FILTER_SKIP;
            }
        } catch (exception_var_1) {
            return NodeFilter.FILTER_SKIP;
        }
    }

    var remove_hidden_elements = function (doc_fragment) {
        var to_remove = new Array();
        var walker = document.createTreeWalker(doc_fragment, NodeFilter.SHOW_ELEMENT, none_display_node_filter, false);
        while (walker.nextNode()) {
            to_remove.push(walker.currentNode);
        }
        delete_nodes(to_remove);
    }

    var delete_nodes = function (nodes_to_delete) {
        for (var i = 0; i < nodes_to_delete.length; ++i) {
            var node = nodes_to_delete[i];
            var parent_node = node.parentNode;
            if (parent_node) {
                parent_node.removeChild(node);
            }
        }
    }


    var isWSJ = function (doc_location) {
        var patt = new RegExp('wsj\.com|marketwatch\.com', 'i');
        return patt.test(doc_location);
    }


    var isGawkerSite = function (doc_location) {
        var gawker_sites = ['io9\.com', 'gawker\.com', 'gizmodo\.com', 'kotaku\.com', 'jalopnik\.com',
            'lifehacker\.com', 'deadspin\.com', 'jezebel\.com'];
        for (var i = 0; i < gawker_sites.length; ++i) {
            var patt = new RegExp(gawker_sites[i], 'i');
            if (patt.test(doc_location)) {
                return true;
            }
        }
        return false;
    }

    var sharebox_id = "__nir-sharebox"

    var bookmarklet_host = function () {
        return 'www.reader2000.com';
    }

    window.__nir_get_info_from_parent = function () {
        $("#" + sharebox_id).find("iframe").css('border', 0);
        var selection_html = get_selection_html();
        var empty_selection = ($.trim(selection_html) === '');

        var full_html = fabricate_selection('body');
        if (full_html === '') {
            full_html = $("body").html();
        }

        // var win = $("#" + sharebox_id).find("iframe")[0].contentWindow;

        var title = document.title;
        var source_url = document.URL;

        if (/www\.google\.[^/]+\/reader/.test(document.location) && typeof(window.getPermalink) == 'function') {
            var l = window.getPermalink();
            validate_item(l, "Open an item first!");
            title = l.title;
            source_url = l.url;

            if (empty_selection) {
                selection_html = $("#current-entry .item-body > div").html()
            }
        } else if (/cloud\.feedly\.com\//.test(document.location)) {
            var $item = $(".selectedEntry");

            if (!$item.get(0)) {
                // seems like sometimes selectedEntry doesn't exist, but inlineFrame does...
                $item = $(".inlineFrame");
            }

            validate_item($item.get(0), "Open an item first!");

            var $header = $item.find(".entryHolder .entryTitle");

            var div = document.createElement(div);
            div.innerHTML = $header.html();
            title = div.firstChild.nodeValue;

            source_url = $header.attr("href");

            if (empty_selection) {
                selection_html = $item.find(".entryBody > .content").html()
            }
        } else if (/newsblur\.com\//.test(document.location)) {
            var $item = $(".NB-feed-story.NB-selected, div.NB-feed-story:has(.NB-feed-story-content)");
            validate_item($item.get(0), "Open an item first!");

            try {
                $item = $(remove_newsblur_annoyances($item.get(0)));
            } catch (exception_var_1) {
                console.error(exception_var_1);
            }

            var $header = $item.find(".NB-feed-story-title");

            var div = document.createElement(div);
            div.innerHTML = $header.html();
            title = div.firstChild.nodeValue;

            source_url = $header.attr("href");

            if (empty_selection) {
                selection_html = $item.find(".NB-feed-story-content").html();
            }
        } else if (/digg\.com\/reader/.test(document.location)) {
            var $item = $(".feeditem-list.expanded");

            validate_item($item.get(0), "Open an item first!");

            var $header = $item.find(".story-title > a");

            var div = document.createElement(div);
            div.innerHTML = $header.html();
            title = div.firstChild.nodeValue;

            source_url = $header.attr("href");

            if (empty_selection) {
                selection_html = $item.find(".detail-body").html();
            }
        } else if (empty_selection && isGawkerSite(document.location)) {
            selection_html = fabricate_selection(".post-content.entry-content, .entry-content, .post-content");
        } else if (empty_selection && isWSJ(document.location)) {
            selection_html = fabricate_selection('#articleBody');
        } else if (empty_selection) {
            var site_selectors = {
                'buzzfeed\\.com': 'div[data-print="body"]',
                'theverge\\.com': '.article-body',
                'theatlantic\\.com': '.article-content',
                'reason\\.com': '.entry',
                'talkingpointsmemo\\.com': 'section.story',
                'reuters\\.com': '#articleText',
                'nytimes\\.com': '#story',
                'bloombergview\\.com': '.article_body',
                'newyorker\\.com': '.entry-content',
                'foxnews\\.com': 'div[itemprop="articleBody"]',
                'techcrunch\\.com': '.article-entry'
            };

            for (var pattern in site_selectors) {
                var regex = new RegExp(pattern, "i");
                if (regex.test(document.location)) {
                    selection_html = fabricate_selection(site_selectors[pattern]);
                    break;
                }
            }
        }

        var target = window.location.protocol + "//" + bookmarklet_host();
        var domain = chrome.extension.getURL('');
        domain = domain.substring(0, domain.lastIndexOf('/'));
        var payload = {
            'cmd': 'populate_share',
            'originator': 'r2k',
            'title': title,
            'selection': selection_html,
            'full_html': full_html,
            'source_url': source_url,
            'domain': domain,
            'target': target
        }

        chrome.runtime.sendMessage(payload, function(response) {
            console.debug("injection.js got response: " + response);
        });
    }

    var fabricate_selection = function (selector) {
        try {
            // TODO: Refactor this
            var doc_fragment = document.createDocumentFragment();
            if ($.isArray(selector)) {
                var share_content = document.createElement("div");
                doc_fragment.appendChild(share_content);
                for (var i = 0; i < selector.length; i++) {
                    var item = document.querySelector(selector[i]);
                    if (item) {
                        console.log("adding: " + item);
                        share_content.append(item.cloneNode(true));
                    }
                }
            } else {
                var item = document.querySelector(selector);
                if (item) {
                    doc_fragment.appendChild(item.cloneNode(true));
                }
            }

            if (doc_fragment.firstElementChild) {
                filter_doc_fragment(doc_fragment);
                return doc_fragment.firstElementChild.outerHTML;
            } else {
                return '';
            }
        } catch (exception_var_2) {
            console.error(exception_var_2);
            return '';
        }
    }


    var validate_item = function (item, message) {
        if (!item) {
            alert(message);
            window.__remove_sharebox();
            throw(0);
        }
    }

    var remove_newsblur_annoyances = function (share_node) {
        var doc_fragment = document.createDocumentFragment();
        doc_fragment.appendChild(share_node.cloneNode(true));
        var $item = $(doc_fragment.firstChild);
        $item.find("del").remove();

        // remove slashdot ads.

        $item.find('a[rel="nofollow"] > img[style~="hidden"]').parent().remove();
        $item.find("ins").each(function (idx, elm) {
            if (elm.firstChild && elm.firstChild.nodeType === Node.TEXT_NODE) {
                $(elm.firstChild).unwrap();
            }
        });
        return $item.get();
    }

});
