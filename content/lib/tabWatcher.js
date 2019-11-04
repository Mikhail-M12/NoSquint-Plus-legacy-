// this module handle new tab open event and set zoom and style
"use strict";

var EXPORTED_SYMBOLS = ["tabWatcher"];

const Cu = Components.utils;

Cu.import("chrome://zoomlevel/content/lib/viewManager.js");

Cu.import("chrome://zoomlevel/content/lib/windowWatcher.js");

Cu.import("chrome://zoomlevel/content/lib/utils.js");

try{
	Cu.import("resource://gre/modules/Console.jsm"); 
}
catch(error){
	Cu.import("resource://gre/modules/"+"devtools"+"/Console.jsm");
}

var progressListener = {
    onLocationChange: function (tab) {
		
        //normalize chrome tabs
        if (prefController.isChrome(tab.currentURI.spec)) {
            viewManager.normalizeTab(tab, [100, 100]);		
            //return;
        }
		
        var isPrivate = isTabPrivate(tab);
        var site = prefController.getSiteFromURI(tab.currentURI);
        var zoom = prefController.getZoomForSiteWithDefaults(site, isPrivate);
        var style = prefController.getStyleForSiteWithDefaults(site, isPrivate);

        viewManager.setTabZoom(tab, zoom);
        viewManager.setTabStyle(tab, style);
		
        prefController.updateSiteTimestamp(site);
		
		viewManager.updateIndicator(tab);
    }	
};

var tabWatcher = {
    init: function () {
        watchWindows(function () {
            var gBrowser = getgBrowser();
            gBrowser.addTabsProgressListener(progressListener);
			
			gBrowser.tabContainer.addEventListener('TabOpen', tabWatcher.tabOpenListener, false);
			gBrowser.tabContainer.addEventListener('TabSelect', tabWatcher.tabSelectListener, false);
			//gBrowser.tabContainer.addEventListener('TabClose', tabWatcher.tabCloseListener, false);				
        });

        //save timestamp for open tabs
        iterTabs(function (tab) {
            var site = prefController.getSiteFromURI(tab.currentURI);
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
		
		gBrowser.tabContainer.removeEventListener('TabOpen', tabWatcher.tabOpenListener, false);
		gBrowser.tabContainer.removeEventListener('TabSelect', tabWatcher.tabSelectListener, false);
		//gBrowser.tabContainer.removeEventListener('TabClose', tabWatcher.tabCloseListener, false);		
    },
	tabOpenListener: function(event){
		var tab = event.target;
		viewManager.updateIndicator(tab.linkedBrowser);
	},	
	tabSelectListener: function(event){
		var tab = event.target;
		viewManager.updateIndicator(tab.linkedBrowser);
	}
};
