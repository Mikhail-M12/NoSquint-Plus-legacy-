var EXPORTED_SYMBOLS = ["Panel"];

const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

/** Xul.js used to define set of functions similar to tags of overlay.xul **/
Cu.import("chrome://zoomlevel/content/lib/xul.js");

/** We need only panel **/
const { PANEL } = Xul;

function Panel(document, settings) {
    document = document || Services.wm.getMostRecentWindow("navigator:browser").document;
    //var screen = Services.appShell.hiddenDOMWindow.screen;
    var screen = document.defaultView.screen;
    var attrs = {
        noautohide: true,
        style: "padding: 0; margin: 0; width: " + screen.width + "px; height: " + screen.height + "px; --panel-background: #00000000; background-color: #00000000; border: none; -moz-appearance: none !important;"
    };
    var overlay = PANEL(attrs);
    this.panel = overlay.build(document.getElementById("mainPopupSet"));

    this.iframe = document.createXULElement("iframe");
    this.iframe.setAttribute("src", settings.contentURL);
    this.iframe.setAttribute("flex", "1");
    this.panel.appendChild(this.iframe);
}

Panel.prototype = {
    open: function (document) {
		document = document || Services.wm.getMostRecentWindow("navigator:browser").document;
        //var screen = Services.appShell.hiddenDOMWindow.screen;
		var screen = document.defaultView.screen;
        this.panel.openPopup(null, "overlap", screen.availLeft, screen.availTop);
    },
    close: function () {
        this.panel.hidePopup();
    },
    destroy: function () {
        this.panel.parentNode.removeChild(this.panel);
    }
};