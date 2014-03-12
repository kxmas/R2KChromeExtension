function executeBookmarklet() {
  chrome.tabs.executeScript({
    file: 'scripts/bookmarklet.js',
    runAt: 'document_end'
  });


}

chrome.browserAction.onClicked.addListener(executeBookmarklet);
chrome.contextMenus.onClicked.addListener(executeBookmarklet);

chrome.runtime.onInstalled.addListener(function() {
  var title = "Note in R2K";
  var id = "r2kContextMenu";
  var contexts = [ "page", "selection", "frame" ];
  var id = chrome.contextMenus.create({"id": id, "title": title, "contexts": contexts,
    "enabled": true
  }, function() {
    console.log(chrome.runtime.lastError);
  });
  console.log("created context menu with id: " + id);
});
