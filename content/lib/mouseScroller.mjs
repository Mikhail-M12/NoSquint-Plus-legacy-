// this module handle mouse wheel event
//var EXPORTED_SYMBOLS = ["mouseScroller"];

const Services = globalThis.Services;

var {watchWindows} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/windowWatcher.mjs");
var {prefController} = 
ChromeUtils.importESModule("chrome://zoomlevel/content/lib/viewManager.mjs");

var {getgBrowser, isTabPrivate} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/utils.mjs");

export var mouseScroller = {
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
