function requestShareInfo() {
    console.log("sending 'send_info' message from popup.js");
    chrome.runtime.sendMessage({'cmd': 'send_info'});
}

function receiveHTMLMessage(event) {
    console.debug("received event: " + event);
    if (event.origin !== "https://www.reader2000.com" && event.origin !== "http://www.reader2000.com") {
        return;
    }
    switch (event.data) {
        case "hide_sharebox":
            var iframe = $("#__nir-sharebox").find("iframe.r2k-iframe")[0];
            var iframeOnLoad = function(pageShowEvent) {
                console.log("pageShowEvent: %s", pageShowEvent);
                iframe.removeEventListener("load", iframeOnLoad, false);
                chrome.runtime.onMessage.removeListener(receiveExtensionMessage);
                chrome.runtime.sendMessage(event.data);
            }
            iframe.addEventListener("load", iframeOnLoad, false);
            break;
        case "remove_sharebox":
            chrome.runtime.onMessage.removeListener(receiveExtensionMessage);
        default:
            chrome.runtime.sendMessage(event.data);
    }

}

var receiveExtensionMessage = function(request, sender, sendResponse) {
    if (request.cmd === "popup_populate_share") {
        var domain = chrome.extension.getURL('');
        request.domain = domain.substring(0, domain.lastIndexOf('/'));
        $("#__nir-sharebox").find("iframe.r2k-iframe")[0].contentWindow.postMessage(request, request.target);
    } else if (request.cmd === "set_iframe_src") {
        $("iframe.r2k-iframe").attr("src", request.source_url);
    }
}

$(document).ready(function() {
    window.addEventListener("message", receiveHTMLMessage, false);
    $(".r2k-iframe").on( "load", function(event) {
        requestShareInfo();
    });
});


chrome.runtime.onMessage.addListener(receiveExtensionMessage);