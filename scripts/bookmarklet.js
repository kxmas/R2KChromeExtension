(function () {
    function inject() {
        var d = document,
            host = 'www.reader2000.com',
            z = d.createElement('scr' + 'ipt'),
            b = d.body,
            l = d.location;	    
        try {
            if (!b) throw (0);
            window['__nir_bookmarklet_host'] = host;	    
            z.setAttribute('src', chrome.extension.getURL("scripts/injection.js"));
            z.id = '__nir-injection-script';
            b.appendChild(z);
        } catch (e) {
            alert('Please wait until the page has loaded.');
        }
    }
    inject();
    void(0);
    return ["success!"];
})();
