const Cu = Components.utils;

const Services = globalThis.Services;

var ui,tabWatcher,mouseScroller;

const extensionLink = "chrome://zoomlevel/",
	contentLink = extensionLink + "content/",
	uiModuleLink = contentLink + "ui.mjs",
	prefModuleLink = contentLink + "lib/preferencesLoader.mjs",
	mouseScrollerLink = contentLink + "lib/mouseScroller.mjs",
	tabWatcherLink = contentLink + "lib/tabWatcher.mjs";

function startup(data, reason) {
	const {setDefaultPref} = ChromeUtils.importESModule(prefModuleLink);
	//Note for validator:: This is safe and used to register our add-on preferences.
	Services.scriptloader.loadSubScript("chrome://zoomlevel/content/prefs.js", {pref: setDefaultPref});
	ui = ChromeUtils.importESModule(uiModuleLink).ui;
	mouseScroller = ChromeUtils.importESModule(mouseScrollerLink).mouseScroller;
	tabWatcher = ChromeUtils.importESModule(tabWatcherLink).tabWatcher;
	loadAddon();
}

function shutdown(data, reason) {
	try{
		if (reason == APP_SHUTDOWN)
			return;
		unloadAddon();
		Cu.unload(uiModuleLink);
		Cu.unload(prefModuleLink);
		Cu.unload(mouseScrollerLink);
		Cu.unload(tabWatcherLink);
		Services.obs.notifyObservers(null, "chrome-flush-caches", null);
	}
	catch(e){}
}

function loadAddon() {
	//register frame script
	Services.mm.loadFrameScript("chrome://zoomlevel/content/frame.js", true);
	initSiteSpecific();
	ui.attach();
	tabWatcher.init();
	mouseScroller.init();
}

var originalSiteSpecific = true;

//set browser.zoom.siteSpecific to false and save previous value
function initSiteSpecific(){
	var svc = Components.classes["@mozilla.org/preferences-service;1"].getService(
		Components.interfaces.nsIPrefService);
	svc.QueryInterface(Components.interfaces.nsIPrefBranch);
	originalSiteSpecific = svc.getBoolPref("browser.zoom.siteSpecific");
	svc.setBoolPref("browser.zoom.siteSpecific", false);
}

function unloadAddon() {
	Services.mm.removeDelayedFrameScript("chrome://zoomlevel/content/frame.js");
	restoreSiteSpecific();
	tabWatcher.destroy();
	mouseScroller.destroy();
	ui.destroy();
}

//restore browser.zoom.siteSpecific value
function restoreSiteSpecific(){
	var svc = Components.classes["@mozilla.org/preferences-service;1"].getService(
		Components.interfaces.nsIPrefService);
	svc.QueryInterface(Components.interfaces.nsIPrefBranch);
	svc.setBoolPref("browser.zoom.siteSpecific", originalSiteSpecific);
}

function install(data) {
	/** Present here only to avoid warning on addon installation **/
}

function uninstall(aData, aReason) {
	if (aReason == ADDON_UNINSTALL) {
		Services.prefs.deleteBranch("extensions.zoomlevel.");
	}
}