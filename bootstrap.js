const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

//const build = 1509493827; //56.1

const extensionLink = "chrome://zoomlevel/",
    contentLink = extensionLink + "content/",
    uiModuleLink = contentLink + "ui.jsm",
    prefModuleLink = contentLink + "lib/preferencesLoader.js",
    mouseScrollerLink = contentLink + "lib/mouseScroller.js",
    tabWatcherLink = contentLink + "lib/tabWatcher.js";

function startup(data, reason) {
    Cu.import(prefModuleLink);
    //Note for validator:: This is safe and used to register our add-on preferences.
    Services.scriptloader.loadSubScript("chrome://zoomlevel/content/prefs.js", {pref: setDefaultPref});
    Cu.import(uiModuleLink);
    Cu.import(mouseScrollerLink);
    Cu.import(tabWatcherLink);
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
    tabWatcher.init();
    mouseScroller.init();
    ui.attach();
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