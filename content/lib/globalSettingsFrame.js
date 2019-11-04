addEventListener("DOMContentLoaded", function (event) {
    content.document.getElementById("rememberSitesOn").addEventListener("click", rememberSites_click);
    content.document.getElementById("rememberSitesOff").addEventListener("click", rememberSites_click);
    content.document.getElementById("forgetMonthEnabled").addEventListener("click", forgetMonthEnabled_click);
    content.document.getElementById("textColorEnabled").addEventListener("click", textColorEnabled_click);
    content.document.getElementById("backgroundColorEnabled").addEventListener("click", backgroundColorEnabled_click);
    content.document.getElementById("linksUnvisitedEnabled").addEventListener("click", linksUnvisitedEnabled_click);
    content.document.getElementById("linksVisitedEnabled").addEventListener("click", linksVisitedEnabled_click);

    content.document.getElementById("addException").addEventListener("click", addException_click);
    content.document.getElementById("editException").addEventListener("click", editException_click);
    content.document.getElementById("deleteException").addEventListener("click", deleteException_click);

    content.document.getElementById("deleteExcludedSite").addEventListener("click", deleteExcludedSite_click);

    content.document.getElementById("ok").addEventListener("click", ok_click);
    content.document.getElementById("cancel").addEventListener("click", cancel_click);

    sendAsyncMessage("zoomlevel-globalSettings-load");
});

function rememberSites_click() {
    var isOn = content.document.getElementById("rememberSitesOn").checked;
    content.document.getElementById("forgetMonthEnabled").disabled = !isOn;
    var isForget = content.document.getElementById("forgetMonthEnabled").checked;
    content.document.getElementById("forgetMonthCount").disabled = !(isOn && isForget);
}

function forgetMonthEnabled_click() {
    var isForget = content.document.getElementById("forgetMonthEnabled").checked;
    content.document.getElementById("forgetMonthCount").disabled = !isForget;
}

function textColorEnabled_click() {
    var isEnabled = content.document.getElementById("textColorEnabled").checked;
    content.document.getElementById("textColor").disabled = !isEnabled;
}

function backgroundColorEnabled_click() {
    var isEnabled = content.document.getElementById("backgroundColorEnabled").checked;
    content.document.getElementById("backgroundColor").disabled = !isEnabled;
}

function linksUnvisitedEnabled_click() {
    var isEnabled = content.document.getElementById("linksUnvisitedEnabled").checked;
    content.document.getElementById("linksUnvisited").disabled = !isEnabled;
}

function linksVisitedEnabled_click() {
    var isEnabled = content.document.getElementById("linksVisitedEnabled").checked;
    content.document.getElementById("linksVisited").disabled = !isEnabled;
}

function addException_click() {
    var except = content.window.prompt("Enter new rule");
    if (except) {
        addException(except);
    }
}

function editException_click() {
    var exceptionsSelect = content.document.getElementById("exceptions");
    if (exceptionsSelect.selectedIndex === -1) {
        return;
    }
    var selectedOption = exceptionsSelect.options[exceptionsSelect.selectedIndex];
    var except = content.window.prompt("Edit rule", selectedOption.value);
    if (except) {
        selectedOption.value = except;
        selectedOption.text = except;
    }
}

function deleteException_click() {
    var exceptionsSelect = content.document.getElementById("exceptions");
    if (exceptionsSelect.selectedIndex === -1) {
        return;
    }
    if (content.window.confirm("Delete rule?")) {
        exceptionsSelect.remove(exceptionsSelect.selectedIndex);
    }
}

function deleteExcludedSite_click() {
    var excludedSiteSelect = content.document.getElementById("excludedSites");
    if (excludedSiteSelect.selectedIndex === -1) {
        return;
    }
    if (content.window.confirm("Delete excluded site?")) {
        excludedSiteSelect.remove(excludedSiteSelect.selectedIndex);
    }
}

function ok_click() {
    var settings = readSettings();
    sendAsyncMessage("zoomlevel-globalSettings-save", settings);
    sendAsyncMessage("zoomlevel-globalSettings-close");
}

function cancel_click() {
    sendAsyncMessage("zoomlevel-globalSettings-close");
}

function readSettings() {
    var settings = {
        rememberSites: content.document.getElementById("rememberSitesOn").checked,
        forgetMonths: content.document.getElementById("forgetMonthEnabled").checked ? +content.document.getElementById("forgetMonthCount").value : 0,
        fullZoomPrimary: content.document.getElementById("fullZoomPrimaryEnabled").selectedIndex === 0,
        fullZoomLevel: +content.document.getElementById("defaultFullZoom").value,
        textZoomLevel: +content.document.getElementById("defaultTextZoom").value,
        zoomIncrement: +content.document.getElementById("zoomIncrement").value,
        wheelZoomEnabled: content.document.getElementById("wheelZoomEnabled").checked,
        textColor: content.document.getElementById("textColorEnabled").checked ? content.document.getElementById("textColor").value : "0",
        backgroundColor: content.document.getElementById("backgroundColorEnabled").checked ? content.document.getElementById("backgroundColor").value : "0",
        imageBackground: content.document.getElementById("imageBackgroundEnabled").checked,
        linksUnvisited: content.document.getElementById("linksUnvisitedEnabled").checked ? content.document.getElementById("linksUnvisited").value : "0",
        linksVisited: content.document.getElementById("linksVisitedEnabled").checked ? content.document.getElementById("linksVisited").value : "0",
        linksUnderline: content.document.getElementById("linksUnderlineEnabled").checked,
        exceptions: [],
        excludedSites: [],
		zoomIndicatorsEnabled: content.document.getElementById("zoomIndicatorsEnabled").checked 
    };

    var exceptionOptions = content.document.querySelectorAll("#exceptions option");
    for (var i = 0; i < exceptionOptions.length; i++) {
        settings.exceptions.push(exceptionOptions[i].value);
    }

    var excludedSitesOptions = content.document.querySelectorAll("#excludedSites option");
    for (var i = 0; i < excludedSitesOptions.length; i++) {
        settings.excludedSites.push(excludedSitesOptions[i].value);
    }

    return settings;
}

addMessageListener("zoomlevel-globalSettings-init", onInit);
addMessageListener("zoomlevel-globalSettings-linux", onLinux);

function onLinux(message) {
	var document = content.document;
	var link = document.createElement("link");
	link.setAttribute("rel","stylesheet");
	link.setAttribute("type","text/css");
	link.setAttribute("href","chrome://zoomlevel/content/external/tinos/css.css");
	document.head.appendChild(link);
	var link2 = document.createElement("link");
	link2.setAttribute("rel","stylesheet");
	link2.setAttribute("type","text/css");
	link2.setAttribute("href","chrome://zoomlevel/content/lib/linux.css");
	document.head.appendChild(link2);
}

function onInit(message) {
    var settings = message.data;
    content.document.getElementById("rememberSitesOn").checked = settings.rememberSites;
    content.document.getElementById("rememberSitesOff").checked = !settings.rememberSites;
    content.document.getElementById("forgetMonthEnabled").disabled = !settings.rememberSites;
    content.document.getElementById("forgetMonthEnabled").checked = settings.forgetMonths !== 0;
    content.document.getElementById("forgetMonthCount").disabled = !settings.rememberSites;
    content.document.getElementById("forgetMonthCount").value = settings.forgetMonths === 0 ? 12 : settings.forgetMonths;
    content.document.getElementById("fullZoomPrimaryEnabled").selectedIndex = settings.fullZoomPrimary ? 0 : 1;
    content.document.getElementById("defaultFullZoom").value = settings.fullZoomLevel;
    content.document.getElementById("defaultTextZoom").value = settings.textZoomLevel;
    content.document.getElementById("zoomIncrement").value = settings.zoomIncrement;
    content.document.getElementById("wheelZoomEnabled").checked = settings.wheelZoomEnabled;
    content.document.getElementById("textColorEnabled").checked = settings.textColorEnabled;
    content.document.getElementById("textColor").disabled = !settings.textColorEnabled;
    content.document.getElementById("textColor").value = settings.textColor;
    content.document.getElementById("backgroundColorEnabled").checked = settings.backgroundColorEnabled;
    content.document.getElementById("backgroundColor").disabled = !settings.backgroundColorEnabled;
    content.document.getElementById("backgroundColor").value = settings.backgroundColor;
    content.document.getElementById("imageBackgroundEnabled").checked = settings.imageBackgroundEnabled;
    content.document.getElementById("linksUnvisitedEnabled").checked = settings.linksUnvisitedEnabled;
    content.document.getElementById("linksUnvisited").disabled = !settings.linksUnvisitedEnabled;
    content.document.getElementById("linksUnvisited").value = settings.linksUnvisited;
    content.document.getElementById("linksVisitedEnabled").checked = settings.linksVisitedEnabled;
    content.document.getElementById("linksVisited").disabled = !settings.linksVisitedEnabled;
    content.document.getElementById("linksVisited").value = settings.linksVisited;
    content.document.getElementById("linksUnderlineEnabled").checked = settings.linksUnderline;
	content.document.getElementById("zoomIndicatorsEnabled").checked = settings.zoomIndicatorsEnabled;

    for (var i = 0; i < settings.exceptions.length; i++) {
        addException(settings.exceptions[i][0].replace(/%20/g, " "));
    }

    for (var i = 0; i < settings.excludedSites.length; i++) {
        addExcludedSite(settings.excludedSites[i]);
    }
}

function addException(except) {
    var exceptionsSelect = content.document.getElementById("exceptions");

    except = except.replace(/^\w+:\/\//, '');

    var opt = content.document.createElement("option");
    opt.text = except;
    opt.value = except;
    exceptionsSelect.appendChild(opt);
}

function addExcludedSite(excludedSite) {
    var excludedSiteSelect = content.document.getElementById("excludedSites");

    var opt = content.document.createElement("option");
    opt.text = excludedSite;
    opt.value = excludedSite;
    excludedSiteSelect.appendChild(opt);
}