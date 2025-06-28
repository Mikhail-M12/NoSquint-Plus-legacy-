"use strict";

//var EXPORTED_SYMBOLS = ["ui"];

const Services = globalThis.Services;

/** CustomizableUI used to create toolbar button **/
var {CustomizableUI} = ChromeUtils.importESModule("resource:///modules/CustomizableUI.sys.mjs");

/** Xul.js used to define set of functions similar to tags of overlay.xul **/
var {Xul} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/xul.mjs");

var {watchWindows} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/windowWatcher.mjs");

var unload = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/unload.mjs").unload;

var ContextMenu = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/contextMenu.mjs").ContextMenu;

var {SiteSettingsDialog} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/siteSettingsDialog.mjs");

var {prefController, viewManager} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/viewManager.mjs");

var {getgBrowser, isTabPrivate} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/utils.mjs");

const {TOOLBARBUTTON} = Xul;

var need_button_for_wheelzoom = prefController.branchNS.getBoolPref("need_button_for_wheelzoom")? true : false;

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
	this.stringBundle = Services.strings.createBundle('chrome://zoomlevel/locale/overlay.properties?' + Math.random()); // Randomize URI to work around bug 719376 (918033)
}

Ui.prototype = {
	attach: function () {
		this.sss.loadAndRegisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
		this.createToolbarOverlay();
		if (prefController.branchNS.getBoolPref("noContextMenu") == false){
			this.createContextMenu();
		}
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
			tooltiptext: "NoSquint Plus :: "+this.stringBundle.GetStringFromName("buttonMain.tooltipText")
		};

		var overlay = TOOLBARBUTTON(toolbarButtonAttrs);

		var button = overlay.build(doc);
		button.setAttribute("class","toolbarbutton-1 chromeclass-toolbar-additional");
		button.addEventListener("command", mainToolbarButton_onCommand);
		button.addEventListener("auxclick", mainToolbarButton_onaux);
		button.addEventListener("wheel", mainToolbarButton_onwheel);

		var box = doc.createXULElement("box");
		box.setAttribute("orient","horizontal");
		box.setAttribute("align","center");
		box.setAttribute("class","toolbarbutton-icon");
		var label = doc.createXULElement("label");
		label.setAttribute("id","zoomlevel-indicator");
		//label.setAttribute("class", prefController.branchNS.getBoolPref("zoomIndicatorsEnabled") ? "" : "hiddenlabel");
		label.setAttribute("value", "100%/100%");
		box.setAttribute("id","zoomlevel-indicator-box");
		box.setAttribute("hidden", prefController.branchNS.getBoolPref("zoomIndicatorsEnabled") ? "false" : "true");
		box.style.width = "max-content";
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
		button.addEventListener("auxclick", zoomInButton_onaux);

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
		button.addEventListener("auxclick", zoomOutButton_onaux);

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
		var addSiteSettingsMenuItem = function (win) {//errors are hided
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

function mainToolbarButton_onaux(event) {
	if (event.button == 1) {//middle click
		var selBrowser = getgBrowser().selectedBrowser;
		if (event.shiftKey){
			var isPrivate = isTabPrivate(selBrowser);
			var site = prefController.getSiteFromURI(selBrowser.currentURI);
			prefController.zoomResetSite(site, isPrivate);
		} else {
			viewManager.resetTabZoomTemp(selBrowser);
			viewManager.updateIndicator(selBrowser);
		}
	}
}

function mainToolbarButton_onwheel(event) {
	if (need_button_for_wheelzoom)
		if ((event.buttons == 0) && (!event.ctrlKey) && (!event.altKey) && (!event.metaKey) && (!event.shiftKey)) return;
	var selBrowser = getgBrowser().selectedBrowser;
	var isPrivate = isTabPrivate(selBrowser);
	var site = prefController.getSiteFromURI(selBrowser.currentURI);
	var multipl = 1 * (event.buttons + 1);
	if (event.deltaY < 0) prefController.zoomInSite(site, event.shiftKey, isPrivate, multipl);	
	else prefController.zoomOutSite(site, event.shiftKey, isPrivate, multipl);
}

function zoomInButton_onCommand(event) {
	var selBrowser = getgBrowser().selectedBrowser;
	var isPrivate = isTabPrivate(selBrowser);
	var site = prefController.getSiteFromURI(selBrowser.currentURI);
	prefController.zoomInSitePositive(site, event.shiftKey, isPrivate);	
}

function zoomInButton_onaux(event) {
	if (event.button == 1) {//middle click
		var selBrowser = getgBrowser().selectedBrowser;
		var isPrivate = isTabPrivate(selBrowser);
		var site = prefController.getSiteFromURI(selBrowser.currentURI);
		prefController.zoomInSitePositive(site, event.shiftKey, isPrivate, 2);
	}
}

function zoomOutButton_onCommand(event) {
	var selBrowser = getgBrowser().selectedBrowser;
	var isPrivate = isTabPrivate(selBrowser);
	var site = prefController.getSiteFromURI(selBrowser.currentURI);
	prefController.zoomOutSitePositive(site, event.shiftKey, isPrivate);
}

function zoomOutButton_onaux(event) {
	if (event.button == 1) {//middle click
		var selBrowser = getgBrowser().selectedBrowser;
		var isPrivate = isTabPrivate(selBrowser);
		var site = prefController.getSiteFromURI(selBrowser.currentURI);
		prefController.zoomOutSitePositive(site, event.shiftKey, isPrivate, 2);
	}
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
export var ui = new Ui();