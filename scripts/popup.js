function requestShareInfo() {
    console.log("sending 'send_info' message from popup.js");
    chrome.runtime.sendMessage({'cmd': 'send_info'});
}

function receiveHTMLMessage(event) {
    if (event.origin !== "https://www.reader2000.com") {
        return;
    }
    if (event.data === "remove_sharebox" || event.data === "hide_sharebox") {
        chrome.runtime.onMessage.removeListener(receiveExtensionMessage);
    }
    // now just pass it...
    chrome.runtime.sendMessage(event.data);
}

var receiveExtensionMessage = function(request, sender, sendResponse) {
    if (request.cmd === "populate_share") {
        $("#__nir-sharebox").find("iframe")[0].contentWindow.postMessage(request, request.target);
    }
}

$(document).ready(function() {
    window.addEventListener("message", receiveHTMLMessage, false);
    $(".r2k-iframe").on( "load", function(event) {
        requestShareInfo();
    });
});


chrome.runtime.onMessage.addListener(receiveExtensionMessage);