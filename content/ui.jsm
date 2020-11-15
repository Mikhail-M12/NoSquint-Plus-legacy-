"use strict";

var EXPORTED_SYMBOLS = ["ui"];

const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

/** CustomizableUI used to create toolbar button **/
Cu.import("resource:///modules/CustomizableUI.jsm");

/** Log into console (also shown in terminal that runs firefox **/
try{
	Cu.import("resource://gre/modules/Console.jsm"); 
}
catch(error){
	Cu.import("resource://gre/modules/"+"devtools"+"/Console.jsm");
}

/** Xul.js used to define set of functions similar to tags of overlay.xul **/
Cu.import("chrome://zoomlevel/content/lib/xul.js");

Cu.import("chrome://zoomlevel/content/lib/windowWatcher.js");

Cu.import("chrome://zoomlevel/content/lib/unload.js");

Cu.import("chrome://zoomlevel/content/lib/contextMenu.js");

Cu.import("chrome://zoomlevel/content/lib/siteSettingsDialog.js");

Cu.import("chrome://zoomlevel/content/lib/viewManager.js");

Cu.import("chrome://zoomlevel/content/lib/utils.js");

const {TOOLBARBUTTON} = Xul;

/**
 * Add and remove addon user interface - replacement over overlay.xul, which
 * can"t be ported into restartless extension
 */
function Ui() {
    this.mainToolbarButtonId = "toolbar-zoomlevel-maintoolbarbutton";
    this.zoomInButtonId = "toolbar-zoomlevel-zoomIn";
    this.zoomOutButtonId = "toolbar-zoomlevel-zoomOut";
    this.zoomResetButtonId = "toolbar-zoomlevel-zoomReset";
    this.siteSettingsMenuItemId = "contextmenu-zoomlevel-siteSettings";

    /** Css components initialization **/
    this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
        .getService(Components.interfaces.nsIStyleSheetService);
    let ios = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    this.cssUri = ios.newURI("chrome://zoomlevel/skin/overlay.css", null, null);

    /** Import localization properties **/
    this.stringBundle = Services.strings.createBundle('chrome://zoomlevel/locale/overlay.properties?' + Math.random()); // Randomize URI to work around bug 719376
}

Ui.prototype = {
    attach: function () {
        this.sss.loadAndRegisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
        this.createToolbarOverlay();
        this.createContextMenu();
        this.createKeys();
    },

    destroy: function () {
        CustomizableUI.destroyWidget(this.mainToolbarButtonId);
        CustomizableUI.destroyWidget(this.zoomInButtonId);
        CustomizableUI.destroyWidget(this.zoomOutButtonId);
        CustomizableUI.destroyWidget(this.zoomResetButtonId);

        if (this.sss.sheetRegistered(this.cssUri, this.sss.AUTHOR_SHEET)) {
            this.sss.unregisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
        }

        unload();
    },

    createToolbarOverlay: function () {
        var self = this;

        CustomizableUI.createWidget({
            id: this.mainToolbarButtonId,
            defaultArea: CustomizableUI.AREA_NAVBAR,
            type: "custom",
            onBuild: function (doc) {
                try {
                    var overlay = self.createMainToolbarButton(doc);
                }
                catch (e) {
                    console.error(e);
                }

                return overlay;
            }
        });
		
        CustomizableUI.createWidget({
            id: this.zoomInButtonId,
            defaultArea: CustomizableUI.AREA_NAVBAR,
            type: "custom",
            onBuild: function (doc) {
                try {
                    var overlay = self.createZoomInButton(doc);
                }
                catch (e) {
                    console.error(e);
                }

                return overlay;
            }
        });

        CustomizableUI.createWidget({
            id: this.zoomOutButtonId,
            defaultArea: CustomizableUI.AREA_NAVBAR,
            type: "custom",
            onBuild: function (doc) {
                try {
                    var overlay = self.createZoomOutButton(doc);
                }
                catch (e) {
                    console.error(e);
                }

                return overlay;
            }
        });

        CustomizableUI.createWidget({
            id: this.zoomResetButtonId,
            defaultArea: CustomizableUI.AREA_NAVBAR,
            type: "custom",
            onBuild: function (doc) {
                try {
                    var overlay = self.createZoomResetButton(doc);
                }
                catch (e) {
                    console.error(e);
                }

                return overlay;
            }
        });

		if(!prefController.branchNS.getBoolPref("tbplaced")){
			CustomizableUI.addWidgetToArea(this.mainToolbarButtonId, CustomizableUI.AREA_NAVBAR,5);
			CustomizableUI.addWidgetToArea(this.zoomInButtonId, CustomizableUI.AREA_NAVBAR,6);
			CustomizableUI.addWidgetToArea(this.zoomOutButtonId, CustomizableUI.AREA_NAVBAR,7);
			CustomizableUI.addWidgetToArea(this.zoomResetButtonId, CustomizableUI.AREA_NAVBAR,8);
			prefController.branchNS.setBoolPref("tbplaced",true);
		}
		
    },

    createMainToolbarButton: function (doc) {
        let toolbarButtonAttrs = {
            id: this.mainToolbarButtonId,
            label: "NoSquint Plus",
            tooltiptext: "NoSquint Plus :: Click to open up Site Settings panel"
        };

        var overlay = TOOLBARBUTTON(toolbarButtonAttrs);

        var button = overlay.build(doc);
		button.setAttribute("class","toolbarbutton-1 chromeclass-toolbar-additional");
        button.addEventListener("command", mainToolbarButton_onCommand);
		
		var box = doc.createXULElement("box");
		box.setAttribute("orient","horizontal");					
		box.setAttribute("align","center");
		box.setAttribute("class","toolbarbutton-icon");
		//var image = doc.createElement("image");
		//image.setAttribute("class", Services.vc.compare(Services.appinfo.platformVersion, "56.0") >= 0 ? "hiddenimage" : "");
		var label = doc.createXULElement("label");
		label.setAttribute("id","zoomlevel-indicator");
		//label.setAttribute("class", prefController.branchNS.getBoolPref("zoomIndicatorsEnabled") ? "" : "hiddenlabel");
		label.setAttribute("value", "100%/100%");
		box.setAttribute("id","zoomlevel-indicator-box");
		box.setAttribute("hidden", prefController.branchNS.getBoolPref("zoomIndicatorsEnabled") ? "false" : "true");
		//box.appendChild(image);
		box.appendChild(label);
		button.appendChild(box);

        return button;
    },
	
    createZoomInButton: function (doc) {
        let toolbarButtonAttrs = {
            id: this.zoomInButtonId,
            label: this.stringBundle.GetStringFromName("buttonZoomIn.label"),
            tooltiptext: this.stringBundle.GetStringFromName("buttonZoomIn.tooltipText")
        };

        var overlay = TOOLBARBUTTON(toolbarButtonAttrs);

        var button = overlay.build(doc);
		button.setAttribute("class","toolbarbutton-1");
        button.addEventListener("command", zoomInButton_onCommand);

        return button;
    },

    createZoomOutButton: function (doc) {
        let toolbarButtonAttrs = {
            id: this.zoomOutButtonId,
            label: this.stringBundle.GetStringFromName("buttonZoomOut.label"),
            tooltiptext: this.stringBundle.GetStringFromName("buttonZoomOut.tooltipText")
        };

        var overlay = TOOLBARBUTTON(toolbarButtonAttrs);

        var button = overlay.build(doc);
		button.setAttribute("class","toolbarbutton-1");
        button.addEventListener("command", zoomOutButton_onCommand);

        return button;
    },

    createZoomResetButton: function (doc) {
        let toolbarButtonAttrs = {
            id: this.zoomResetButtonId,
            label: this.stringBundle.GetStringFromName("buttonZoomReset.label"),
            tooltiptext: this.stringBundle.GetStringFromName("buttonZoomReset.tooltipText")
        };

        var overlay = TOOLBARBUTTON(toolbarButtonAttrs);

        var button = overlay.build(doc);
		button.setAttribute("class","toolbarbutton-1");
        button.addEventListener("command", zoomResetButton_onCommand);

        return button;
    },

    createContextMenu: function () {
        var self = this;

        var addSiteSettingsMenuItem = function (win) {
            var attrs = {
                id: self.siteSettingsMenuItemId,
                label: self.stringBundle.GetStringFromName("menuItemSiteSettings.label"),
                onCommand: addSiteSettingsMenuItem_onCommand
            };
            ContextMenu.add(win, attrs);

            var removeSiteSettingsMenuItem = function () {
                ContextMenu.remove(win, self.siteSettingsMenuItemId);
            };

            unload(removeSiteSettingsMenuItem, win);
        };

        watchWindows(addSiteSettingsMenuItem);
    },
	
    createKeys: function () {
        var self = this;

        var addKeys = function (win) {
				//Note for Validator :: This is safe and we have to overwrite default keys of Firefox for our add-on functionality
				win.document.getElementById("cmd_fullZoomEnlarge").setAttribute("oncommand","void(0);");
				win.document.getElementById("cmd_fullZoomEnlarge").addEventListener("command",zoomInButton_onCommand,false);
				//Note for Validator :: This is safe and we have to overwrite default keys of Firefox for our add-on functionality
				win.document.getElementById("cmd_fullZoomReduce").setAttribute("oncommand","void(0);");
				win.document.getElementById("cmd_fullZoomReduce").addEventListener("command",zoomOutButton_onCommand,false);
				//Note for Validator :: This is safe and we have to overwrite default keys of Firefox for our add-on functionality
				win.document.getElementById("cmd_fullZoomReset").setAttribute("oncommand","void(0);");
				win.document.getElementById("cmd_fullZoomReset").addEventListener("command",zoomResetButton_onCommand,false);	

            var resetKeys = function () {
				//Note for Validator :: This is safe and we have to reset back Firefox's default key.
				win.document.getElementById("cmd_fullZoomEnlarge").setAttribute("oncommand","FullZoom.enlarge()");
				win.document.getElementById("cmd_fullZoomEnlarge").removeEventListener("command",zoomInButton_onCommand,false);
				//Note for Validator :: This is safe and we have to reset back Firefox's default key.
				win.document.getElementById("cmd_fullZoomReduce").setAttribute("oncommand","FullZoom.reduce()");
				win.document.getElementById("cmd_fullZoomReduce").removeEventListener("command",zoomOutButton_onCommand,false);
				//Note for Validator :: This is safe and we have to reset back Firefox's default key.
				win.document.getElementById("cmd_fullZoomReset").setAttribute("oncommand","FullZoom.reset()");
				win.document.getElementById("cmd_fullZoomReset").removeEventListener("command",zoomResetButton_onCommand,false);
            };

            unload(resetKeys, win);
        };

        watchWindows(addKeys);
    }	
};

function mainToolbarButton_onCommand(event) {
    var siteSettingsDialog = new SiteSettingsDialog();
    siteSettingsDialog.open();
}

function zoomInButton_onCommand(event) {
    var selBrowser = getgBrowser().selectedBrowser;
    var isPrivate = isTabPrivate(selBrowser);
    var site = prefController.getSiteFromURI(selBrowser.currentURI);
    prefController.zoomInSite(site, event.shiftKey, isPrivate);	
}

function zoomOutButton_onCommand(event) {
    var selBrowser = getgBrowser().selectedBrowser;
    var isPrivate = isTabPrivate(selBrowser);
    var site = prefController.getSiteFromURI(selBrowser.currentURI);
    prefController.zoomOutSite(site, event.shiftKey, isPrivate);
}

function zoomResetButton_onCommand() {
    var selBrowser = getgBrowser().selectedBrowser;
    var isPrivate = isTabPrivate(selBrowser);
    var site = prefController.getSiteFromURI(selBrowser.currentURI);
    prefController.zoomResetSite(site, isPrivate);
}

function addSiteSettingsMenuItem_onCommand() {
    var siteSettingsDialog = new SiteSettingsDialog();
    siteSettingsDialog.open();
}

/** Singleton to avoid multiple initialization for startup and shutdown **/
var ui = new Ui();