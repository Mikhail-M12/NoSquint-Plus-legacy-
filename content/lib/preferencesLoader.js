const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

var EXPORTED_SYMBOLS = ["setDefaultPref"];

function getGenericPref(branch, prefName) {
    switch (branch.getPrefType(prefName)) {
        default:
        case 0:
            return undefined;                      // PREF_INVALID
        case 32:
            return branch.getStringPref(prefName); //getUCharPref(prefName, branch);  // PREF_STRING
        case 64:
            return branch.getIntPref(prefName);    // PREF_INT
        case 128:
            return branch.getBoolPref(prefName);   // PREF_BOOL
    }
}

function setGenericPref(branch, prefName, prefValue) {
    switch (typeof prefValue) {
        case "string":
            branch.setStringPref(prefName, prefValue);//setUCharPref(prefName, prefValue, branch);
            return;
        case "number":
            branch.setIntPref(prefName, prefValue);
            return;
        case "boolean":
            branch.setBoolPref(prefName, prefValue);
            return;
    }
}

function setDefaultPref(prefName, prefValue) {
    var defaultBranch = Services.prefs.getDefaultBranch(null);
    setGenericPref(defaultBranch, prefName, prefValue);
}

function getUCharPref(prefName, branch)  // Unicode getCharPref
{
    branch = branch ? branch : Services.prefs;
    return branch.getStringPref(prefName);
}

function setUCharPref(prefName, text, branch)  // Unicode setCharPref
{
    var string = Components.classes["@mozilla.org/supports-string;1"]
        .createInstance(Components.interfaces.nsISupportsString);
    string.data = text;
    branch = branch ? branch : Services.prefs;
    branch.setStringPref(prefName, string);
}