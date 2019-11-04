"use strict";

var EXPORTED_SYMBOLS = ["SiteSettingsDialog"];

const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

Cu.import("chrome://zoomlevel/content/lib/panel.js");

Cu.import("chrome://zoomlevel/content/lib/viewManager.js");

Cu.import("chrome://zoomlevel/content/lib/globalSettingsDialog.js");

Cu.import("chrome://zoomlevel/content/lib/utils.js");

function init() {
    this.document = this.panel.iframe.contentWindow.document;
    this.document.getElementById("close").addEventListener("click", cancel_click.bind(this));
    this.document.getElementById("fullZoomRange").addEventListener("input", fullZoomRange_input.bind(this));
    this.document.getElementById("fullZoom").addEventListener("input", fullZoom_input.bind(this));
    this.document.getElementById("fullZoomUseDefault").addEventListener("click", fullZoomUseDefault_click.bind(this));
    this.document.getElementById("textZoomRange").addEventListener("input", textZoomRange_input.bind(this));
    this.document.getElementById("textZoom").addEventListener("input", textZoom_input.bind(this));
    this.document.getElementById("textZoomUseDefault").addEventListener("click", textZoomUseDefault_click.bind(this));
    this.document.getElementById("textColorEnabled").addEventListener("click", textColorEnabled_click.bind(this));
    this.document.getElementById("textColor").addEventListener("input", textColor_input.bind(this));

    this.document.getElementById("backgroundColorEnabled").addEventListener("click", backgroundColorEnabled_click.bind(this));
    this.document.getElementById("backgroundColor").addEventListener("input", backgroundColor_input.bind(this));
    this.document.getElementById("imageBackgroundEnabled").addEventListener("click", imageBackgroundEnabled_click.bind(this));
    this.document.getElementById("linksUnvisitedEnabled").addEventListener("click", linksUnvisitedEnabled_click.bind(this));
    this.document.getElementById("linksUnvisited").addEventListener("input", linksUnvisited_input.bind(this));
    this.document.getElementById("linksVisitedEnabled").addEventListener("click", linksVisitedEnabled_click.bind(this));
    this.document.getElementById("linksVisited").addEventListener("input", linksVisited_input.bind(this));
    this.document.getElementById("linksUnderlineEnabled").addEventListener("click", linksUnderlineEnabled_click.bind(this));
    this.document.getElementById("ok").addEventListener("click", ok_click.bind(this));
    this.document.getElementById("cancel").addEventListener("click", cancel_click.bind(this));
    this.document.getElementById("globalSettings").addEventListener("click", globalSettings_click.bind(this));
	
    //this.document.getElementById("get_chrome").addEventListener("click", get_chrome.bind(this));	
    //this.document.getElementById("get_opera").addEventListener("click", get_opera.bind(this));
	
    this.site = prefController.getSiteFromURI(getgBrowser().currentURI);
    this.isPrivate = isTabPrivate(getgBrowser().selectedBrowser);
    this.document.getElementById("siteURL").textContent = this.site;

    var [textLevel, fullLevel] = prefController.getZoomForSiteWithDefaults(this.site, this.isPrivate);
    var styles = prefController.getStyleForSite(this.site, this.isPrivate);

    this.document.getElementById("fullZoom").value = fullLevel;
    this.document.getElementById("fullZoomRange").value = fullLevel;
    this.document.getElementById("textZoom").value = textLevel;
    this.document.getElementById("textZoomRange").value = textLevel;

    for (let [id, defcolor] of items(prefController.defaultColors)) {
        var hasValue = styles && (styles[id] !== "0");
        this.document.getElementById(id).value = hasValue ? styles[id] : defcolor;
        this.document.getElementById(id).disabled = !hasValue;
        this.document.getElementById(id + "Enabled").checked = hasValue;
    }

    for (let attr of iter(["imageBackground", "linksUnderline"])) {
        var hasValue = styles && styles[attr];
        this.document.getElementById(attr + "Enabled").checked = hasValue;
    }

	//if (typeof prefController.excludedSites !== 'undefined')
	this.document.getElementById("isSiteExcluded").checked = prefController.excludedSites.indexOf(this.site) !== -1;
	
	var NoSquintPlus ={
		documenttomousemoveo:function(event){
			var document = event.currentTarget;
			var window = document.defaultView;
			var div = document.querySelector("div[class*='content']");		
			if (NoSquintPlus.inmovemode){
				NoSquintPlus.currenteventx=event.pageX;
				NoSquintPlus.currenteventy=event.pageY;
				NoSquintPlus.moveonxpath=NoSquintPlus.currenteventx-NoSquintPlus.moouseclickeventx;
				NoSquintPlus.moveonypath=NoSquintPlus.currenteventy-NoSquintPlus.moouseclickeventy;
				var placeonx=NoSquintPlus.currentbackgroundpositionxvalue+NoSquintPlus.moveonxpath;
				var placeony=NoSquintPlus.currentbackgroundpositionyvalue+NoSquintPlus.moveonypath;
				var dragboxplaceonx=NoSquintPlus.currentdragboxpositionxvalue+NoSquintPlus.moveonxpath;
				var dragboxplaceony=NoSquintPlus.currentdragboxpositionyvalue+NoSquintPlus.moveonypath;
				//window.content.status = NoSquintPlus.currentbackgroundpositionyvalue + "++++" + NoSquintPlus.moveonypath;
				div.style.left=placeonx+"px";
				div.style.top=placeony+"px";
				//dragbox.style.left=dragboxplaceonx+"px";
				//dragbox.style.top=dragboxplaceony+"px";
			}
			event.stopPropagation();
		},
		mouseupondocument:function(event){
			var document = event.currentTarget;
			var window = document.defaultView;
			if (event.button==0){
				NoSquintPlus.inmovemode=false;
				//this.body.style.cursor="default";
				document.removeEventListener("mousemove", NoSquintPlus.documenttomousemoveo ,false);
				document.removeEventListener("mouseup", NoSquintPlus.mouseupondocument ,false);
				NoSquintPlus.currentbackgroundpositionvalues="";
				NoSquintPlus.currentbackgroundpositionxvalue=0;
				NoSquintPlus.currentbackgroundpositionyvalue=0;
				NoSquintPlus.currenteventx=0;
				NoSquintPlus.currenteventy=0;
				NoSquintPlus.moveonxpath=0;
				NoSquintPlus.moveonypath=0;
			}
		},
		inmovemode:false,
		moouseclickeventx:0,
		moouseclickeventy:0,
		currentbackgroundpositionvalues:"",
		currentbackgroundpositionxvalue:0,
		currentbackgroundpositionyvalue:0,
		currentdragboxpositionxvalue:0,
		currentdragboxpositionyvalue:0,
		currenteventx:0,
		currenteventy:0,
		moveonxpath:0,
		moveonypath:0	
	}	
	
	this.document.querySelector("div[class*='title']").setAttribute("style","cursor:move;");
	this.document.querySelector("div[class*='title']").addEventListener("mousedown",function(event){
		var doc=event.currentTarget.ownerDocument;
		var div=doc.querySelector("div[class*='content']");
		NoSquintPlus.inmovemode=true;
		doc.addEventListener("mousemove",NoSquintPlus.documenttomousemoveo,false);
		doc.addEventListener("mouseup",NoSquintPlus.mouseupondocument,false);
		NoSquintPlus.moouseclickeventx=event.pageX;
		NoSquintPlus.moouseclickeventy=event.pageY;
		NoSquintPlus.currentbackgroundpositionxvalue=parseInt(doc.defaultView.getComputedStyle(div, null).getPropertyValue("left").split("px")[0]);
		NoSquintPlus.currentbackgroundpositionyvalue=parseInt(doc.defaultView.getComputedStyle(div, null).getPropertyValue("top").split("px")[0]);
		NoSquintPlus.currentdragboxpositionxvalue=parseInt(doc.defaultView.getComputedStyle(div, null).getPropertyValue("top").split("px")[0]);
		NoSquintPlus.currentdragboxpositionyvalue=parseInt(doc.defaultView.getComputedStyle(div, null).getPropertyValue("left").split("px")[0]); 
	},true);

	var OS = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
    if(true) {//OS == "Linux"
		try{
			var link = this.document.createElement("link");
			link.setAttribute("rel","stylesheet");
			link.setAttribute("type","text/css");
			link.setAttribute("href","chrome://zoomlevel/content/external/tinos/css.css");
			this.document.head.appendChild(link);
			var link2 = this.document.createElement("link");
			link2.setAttribute("rel","stylesheet");
			link2.setAttribute("type","text/css");
			link2.setAttribute("href","chrome://zoomlevel/content/lib/linux.css");
			this.document.head.appendChild(link2);		
		}catch(e){
			//
		}	
	}	
	
}

function fullZoomRange_input() {
    var fullZoomValue = this.document.getElementById("fullZoomRange").value;
    this.document.getElementById("fullZoom").value = fullZoomValue;
    this.previewZoom();
}

function fullZoom_input() {
    var fullZoomValue = this.document.getElementById("fullZoom").value;
    this.document.getElementById("fullZoomRange").value = fullZoomValue;
    this.previewZoom();
}

function fullZoomUseDefault_click() {
    var [textLevel, fullLevel] = prefController.getZoomDefaults(this.site);
    this.document.getElementById("fullZoom").value = fullLevel;
    this.document.getElementById("fullZoomRange").value = fullLevel;
    this.previewZoom();
}

function textZoomRange_input() {
    var textZoomValue = this.document.getElementById("textZoomRange").value;
    this.document.getElementById("textZoom").value = textZoomValue;
    this.previewZoom();
}

function textZoom_input() {
    var textZoomValue = this.document.getElementById("textZoom").value;
    this.document.getElementById("textZoomRange").value = textZoomValue;
    this.previewZoom();
}

function textZoomUseDefault_click() {
    var [textLevel, fullLevel] = prefController.getZoomDefaults(this.site);
    this.document.getElementById("textZoom").value = textLevel;
    this.document.getElementById("textZoomRange").value = textLevel;
    this.previewZoom();
}

function textColorEnabled_click() {
    var isEnabled = this.document.getElementById("textColorEnabled").checked;
    this.document.getElementById("textColor").disabled = !isEnabled;
    this.previewStyle();
}

function textColor_input() {
    this.previewStyle();
}

function backgroundColorEnabled_click() {
    var isEnabled = this.document.getElementById("backgroundColorEnabled").checked;
    this.document.getElementById("backgroundColor").disabled = !isEnabled;
    this.previewStyle();
}

function backgroundColor_input() {
    this.previewStyle();
}

function imageBackgroundEnabled_click() {
    this.previewStyle();
}

function linksUnvisitedEnabled_click() {
    var isEnabled = this.document.getElementById("linksUnvisitedEnabled").checked;
    this.document.getElementById("linksUnvisited").disabled = !isEnabled;
    this.previewStyle();
}

function linksUnvisited_input() {
    this.previewStyle();
}

function linksVisitedEnabled_click() {
    var isEnabled = this.document.getElementById("linksVisitedEnabled").checked;
    this.document.getElementById("linksVisited").disabled = !isEnabled;
    this.previewStyle();
}

function linksVisited_input() {
    this.previewStyle();
}

function linksUnderlineEnabled_click() {
    this.previewStyle();
}

function ok_click() {
    this.save();
    this.close();
}

function cancel_click() {
    this.revert();
    this.close();
}

function globalSettings_click() {
    var globalSettingsDialog = new GlobalSettingsDialog();
    globalSettingsDialog.open();
    this.close();
}

function SiteSettingsDialog() {
    this.panel = new Panel(null, {
        contentURL: "chrome://zoomlevel/content/lib/siteSettings.xhtml"
    });

    this.panel.iframe.addEventListener("DOMContentLoaded", init.bind(this));
}

function get_chrome() {
    var gBrowser = Services.wm.getMostRecentWindow("navigator:browser").gBrowser;
	gBrowser.selectedTab = gBrowser.addTab("https://chrome.google.com/webstore/detail/nosquint-plus/jidjekdcooppfeggehblbigabhaihkgj",{relatedToCurrent: true});
	this.close();
}

function get_opera() {
    var gBrowser = Services.wm.getMostRecentWindow("navigator:browser").gBrowser;
	gBrowser.selectedTab = gBrowser.addTab("https://addons.opera.com/en-gb/extensions/details/nosquint-plus/",{relatedToCurrent: true});
	this.close();
}

SiteSettingsDialog.prototype = {
    open: function () {
        this.panel.open();
    },

    close: function () {
        this.panel.close();
        this.panel.destroy();
    },

    revert: function () {
        var zoom = prefController.getZoomForSiteWithDefaults(this.site, this.isPrivate);
        var style = prefController.getStyleForSiteWithDefaults(this.site, this.isPrivate);
        viewManager.setCurrentTabZoom(zoom);
        viewManager.setCurrentTabStyle(style);
    },

    previewZoom: function () {
        var zoom = this.getZoom();
        viewManager.setCurrentTabZoom(zoom);
    },

    previewStyle: function () {
        var style = this.getStyle();
        if (prefController.excludedSites.indexOf(this.site) === -1) {
            style = prefController.applyStyleGlobals(style);
        }
        viewManager.setCurrentTabStyle(style);
    },

    getZoom: function () {
        var textLevel = +this.document.getElementById("textZoom").value;
        var fullLevel = +this.document.getElementById("fullZoom").value;
        return [textLevel, fullLevel];
    },

    getStyle: function () {
        var style = {enabled: false};
        for (let attr of iter(prefController.defaultColors)) {
            var isChecked = this.document.getElementById(attr + "Enabled").checked;
            var value = this.document.getElementById(attr).value;
            if (value[0] !== "#") {
                value = "#" + value;
            }
            isChecked = isChecked && /^#([0-9a-f]{3})|([0-9a-f]{6})$/i.test(value);

            style[attr] = isChecked ? value : null;
            style.enabled = style.enabled || !!style[attr];
        }
        for (let attr of iter(["imageBackground", "linksUnderline"])) {
            style[attr] = this.document.getElementById(attr + "Enabled").checked;
            style.enabled = style.enabled || style[attr];
        }
        return style;
    },

    save: function () {
        var zoom = this.getZoom();
        var styles = this.getStyle();
        var isSiteExcluded = this.document.getElementById("isSiteExcluded").checked;

        if (isSiteExcluded) {
            prefController.addExcludedSite(this.site);
        } else {
            prefController.removeExcludedSite(this.site);
        }

        prefController.updateSiteList(this.site, zoom, styles, this.isPrivate);
    }
};