"use strict";

var EXPORTED_SYMBOLS = ["GlobalSettingsDialog"];

const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

Cu.import("chrome://zoomlevel/content/lib/viewManager.js");

Cu.import("chrome://zoomlevel/content/lib/utils.js");

try{
	Cu.import("resource://gre/modules/Console.jsm"); 
}
catch(error){
	Cu.import("resource://gre/modules/"+"devtools"+"/Console.jsm");
}

function GlobalSettingsDialog() {

}

GlobalSettingsDialog.prototype = {
	
    open: function () {
        var gBrowser = getgBrowser();
        this.tab = gBrowser.addTab("chrome://zoomlevel/content/lib/globalSettings.xhtml",{relatedToCurrent: true, triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()});
        gBrowser.selectedTab = this.tab;

        this.tabBrowser = gBrowser.getBrowserForTab(this.tab);
        this.tabBrowser.messageManager.loadFrameScript("chrome://zoomlevel/content/lib/globalSettingsFrame.js", true);
			
        var self = this;

        this.tabBrowser.messageManager.addMessageListener("zoomlevel-globalSettings-load", onLoad.bind(this));
        this.tabBrowser.messageManager.addMessageListener("zoomlevel-globalSettings-save", function (msg) {
            self.save(msg.data);
            self.close();
        });
        this.tabBrowser.messageManager.addMessageListener("zoomlevel-globalSettings-close", function (msg) {
            //self.save(msg.data);
            self.close();
        });
        //gBrowser.reload();
    },

    save: function (settings) {
        for (let [id, val] of items(settings)) {
            if (id === "exceptions") continue;
            prefController[id] = val;
        }
        prefController.saveAll(settings.exceptions);
        prefController.save();
    },

    close: function () {
        var gBrowser = getgBrowser();
        gBrowser.removeTab(this.tab);
    }	
};

function onLoad() {
    var settings = {
        rememberSites: prefController.rememberSites,
        forgetMonths: prefController.forgetMonths,
        fullZoomPrimary: prefController.fullZoomPrimary,
        fullZoomLevel: prefController.fullZoomLevel,
        textZoomLevel: prefController.textZoomLevel,
        zoomIncrement: prefController.zoomIncrement,
        wheelZoomEnabled: prefController.wheelZoomEnabled,
        imageBackground: prefController.imageBackground,
        linksUnderline: prefController.linksUnderline,
        exceptions: prefController.exceptions,
        excludedSites: prefController.excludedSites,
        zoomIndicatorsEnabled: prefController.zoomIndicatorsEnabled
    };

    for (let [id, defcolor] of items(prefController.defaultColors)) {
        settings[id] = prefController[id] !== "0" ? prefController[id] : defcolor;
        settings[id + "Enabled"] = prefController[id] !== "0";
    }

    this.tabBrowser.messageManager.sendAsyncMessage("zoomlevel-globalSettings-init", settings);
	//var OS = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
    //if(OS == "Linux") this.tabBrowser.messageManager.sendAsyncMessage("zoomlevel-globalSettings-linux", {});
    if(true) this.tabBrowser.messageManager.sendAsyncMessage("zoomlevel-globalSettings-linux", {});
}