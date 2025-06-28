// this module handle new tab open event and set zoom and style
"use strict";

//var EXPORTED_SYMBOLS = ["tabWatcher"];

var {prefController, viewManager} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/viewManager.mjs");

var {watchWindows} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/windowWatcher.mjs");

var {getgBrowser, iterTabs, isTabPrivate} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/utils.mjs");

var progressListener = {
	onLocationChange: function (tab_lb) {
		
		//normalize chrome tabs
		if (prefController.isChrome(tab_lb.currentURI.spec)) {
			viewManager.normalizeTab(tab_lb, [100, 100]);
			//return;
		}
		
		var isPrivate = isTabPrivate(tab_lb);
		var site = prefController.getSiteFromURI(tab_lb.currentURI);
		var zoom = prefController.getZoomForSiteWithDefaults(site, isPrivate);
		var style = prefController.getStyleForSiteWithDefaults(site, isPrivate);

		viewManager.setTabZoom(tab_lb, zoom);
		viewManager.setTabStyle(tab_lb, style);

		tab_lb.tabHasCustomZoom = true;
		prefController.updateSiteTimestamp(site);
		
		//viewManager.updateIndicator(tab_lb);
	}	
};

export var tabWatcher = {
	init: function () {
		watchWindows(function () {
			var gBrowser = getgBrowser();
			gBrowser.addTabsProgressListener(progressListener);
			
			//gBrowser.tabContainer.addEventListener('TabOpen', tabWatcher.tabOpenListener, false);
			gBrowser.tabContainer.addEventListener('TabSelect', tabWatcher.tabSelectListener, false);
			//gBrowser.tabContainer.addEventListener('TabClose', tabWatcher.tabCloseListener, false);
		});

		//save timestamp for open tabs
		iterTabs(function (tab_lb) {
			var site = prefController.getSiteFromURI(tab_lb.currentURI);
			prefController.updateSiteTimestamp(site);
		});

		//set zoom and style for open tabs
		viewManager.updateAll();
	},

	destroy: function () {
		prefController.save();

		viewManager.normalizeAll();

		var gBrowser = getgBrowser();
		gBrowser.removeTabsProgressListener(progressListener);
		
		//gBrowser.tabContainer.removeEventListener('TabOpen', tabWatcher.tabOpenListener, false);
		gBrowser.tabContainer.removeEventListener('TabSelect', tabWatcher.tabSelectListener, false);
		//gBrowser.tabContainer.removeEventListener('TabClose', tabWatcher.tabCloseListener, false);
	},
	tabSelectListener: function(event){
		var tab = event.target;
		viewManager.updateIndicator(tab.linkedBrowser);
	}
};
