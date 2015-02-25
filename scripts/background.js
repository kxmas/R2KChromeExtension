function showSharebox(tab) {
    chrome.browserAction.setPopup({
        tabId: tab.id,
        popup: 'pages/popup.html'
    });
}

var closeSharebox = function(window, messageListener) {
    chrome.runtime.onMessage.removeListener(messageListener);
    chrome.windows.remove(window.id);
}

var addMessageListener = function(window, tab) {
    var receiveMessage = function (request, sender, sendResponse) {
        var command = (request.cmd ? request.cmd : request);

        console.debug("cmd: " + command);
        switch (command) {
            case "send_info":
                chrome.tabs.executeScript(tab.id, {
                    code: '__nir_get_info_from_parent();',
                    runAt: 'document_end'
                });
                break;
            case "populate_share":
                chrome.tabs.sendMessage(window.tabs[0].id, request);
                break;
            case "remove_sharebox":
                closeSharebox(window, receiveMessage);
                break;
            case "hide_sharebox":
                closeSharebox(window, receiveMessage);
                break;
            default:
                break;
        }
    }
    chrome.runtime.onMessage.addListener(receiveMessage);

}

function executeBookmarklet(tab) {
    chrome.tabs.executeScript(tab.id, {
        file: 'scripts/jquery.js',
        runAt: 'document_end'
    });
    chrome.tabs.executeScript(tab.id, {
        file: 'scripts/injection.js',
        runAt: 'document_end'
    });

    var appWindow = chrome.windows.create({'url':'pages/popup.html', 'type': 'popup', 'height': 540, 'width': 550 }, function(window) {
        console.debug("created window: " + window);
        window.alwaysOnTop = true;
        window.focused = true;
        addMessageListener(window, tab);
    });
}

chrome.browserAction.onClicked.addListener(executeBookmarklet);
chrome.contextMenus.onClicked.addListener(executeBookmarklet);

chrome.runtime.onInstalled.addListener(function () {
    var title = "Note in R2K";
    var id = "r2kContextMenu";
    var contexts = ["page", "selection", "frame", "link", "image"];
    var id = chrome.contextMenus.create({
        "id": id, "title": title, "contexts": contexts,
        "enabled": true
    }, function () {
        console.error(chrome.runtime.lastError);
    });
    console.debug("created context menu with id: " + id);
});

