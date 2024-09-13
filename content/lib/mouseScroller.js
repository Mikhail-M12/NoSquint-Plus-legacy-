// this module handle mouse wheel event
const Cu = Components.utils;

const Services = globalThis.Services || Cu.import("resource://gre/modules/Services.jsm").Services;

Cu.import("chrome://zoomlevel/content/lib/windowWatcher.js");

Cu.import("chrome://zoomlevel/content/lib/viewManager.js");

Cu.import("chrome://zoomlevel/content/lib/utils.js");

var EXPORTED_SYMBOLS = ["mouseScroller"];

var mouseScroller = {
    init: function () {
        watchWindows(function (wind) {
            wind.addEventListener("wheel", handleMouseScroll, false);
        });
    },
    destroy: function () {
        watchWindows(function (wind) {
            wind.removeEventListener("wheel", handleMouseScroll);
        });
    }
};

function handleMouseScroll(event) {
    if (!event.ctrlKey)
        return;

    if (prefController.wheelZoomEnabled) {
        var gBrowser = getgBrowser();
        var isPrivate = isTabPrivate(gBrowser.selectedBrowser);

        var site = prefController.getSiteFromURI(gBrowser.currentURI);

        if (event.deltaY < 0) {
            prefController.zoomInSite(site, event.shiftKey, isPrivate);
        } else {
            prefController.zoomOutSite(site, event.shiftKey, isPrivate);
        }
    }

    event.stopPropagation();
    event.preventDefault();
}

