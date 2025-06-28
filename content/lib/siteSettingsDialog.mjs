"use strict";

//var EXPORTED_SYMBOLS = ["SiteSettingsDialog"];

const Services = globalThis.Services;

var {Panel} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/panel.mjs");

var {prefController, viewManager} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/viewManager.mjs");

var {GlobalSettingsDialog} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/globalSettingsDialog.mjs");

var {getgBrowser, isTabPrivate, items, iter} = ChromeUtils.importESModule("chrome://zoomlevel/content/lib/utils.mjs");

function init() {
	var self = this;
	this.document = this.panel.iframe.contentWindow.document;
	this.document.getElementById("close").addEventListener("click", close_click.bind(this));
	this.site = prefController.getSiteFromURI(getgBrowser().currentURI);
	this.isPrivate = isTabPrivate(this.mytab_lb);
	this.document.getElementById("cancel").addEventListener("click", cancel_click.bind(this));

	this.labelFullzoom=this.document.querySelector("label[for=fullZoom]");
	this.labelTextzoom=this.document.querySelector("label[for=textZoom]");
	this.stytle1=this.document.querySelector("legend#stytle1");
	this.stytle2=this.document.querySelector("legend#stytle2");
	this.zoomfFirstChange_runOnce0 = function (){
	zoomfFirstChange.bind(self)();
	self.fullZoomRangeEl.removeEventListener("input", self.zoomfFirstChange_runOnce0);
	self.fullZoomEl.removeEventListener("input", self.zoomfFirstChange_runOnce0);
	self.fullZoomUseDefaultEl.removeEventListener("click", self.zoomfFirstChange_runOnce0);
	};
	this.zoomtFirstChange_runOnce0 = function (){
	zoomtFirstChange.bind(self)();
	self.textZoomRangeEl.removeEventListener("input", self.zoomtFirstChange_runOnce0);
	self.textZoomEl.removeEventListener("input", self.zoomtFirstChange_runOnce0);
	self.textZoomUseDefaultEl.removeEventListener("click", self.zoomtFirstChange_runOnce0);
	};
	this.styles1FirstChange_runOnce0 = function (){
	styles1FirstChange.bind(self)();
	self.textColorEnabledEl.removeEventListener("click", self.styles1FirstChange_runOnce0);
	self.textColorEl.removeEventListener("input", self.styles1FirstChange_runOnce0);
	self.backgroundColorEnabledEl.removeEventListener("click", self.styles1FirstChange_runOnce0);
	self.backgroundColorEl.removeEventListener("input", self.styles1FirstChange_runOnce0);
	self.imageBackgroundEnabledEl.removeEventListener("click", self.styles1FirstChange_runOnce0);
	};
	this.styles2FirstChange_runOnce0 = function (){
	styles2FirstChange.bind(self)();
	self.linksUnvisitedEnabledEl.removeEventListener("click", self.styles2FirstChange_runOnce0);
	self.linksUnvisitedEl.removeEventListener("input", self.styles2FirstChange_runOnce0);
	self.linksVisitedEnabledEl.removeEventListener("click", self.styles2FirstChange_runOnce0);
	self.linksVisitedEl.removeEventListener("input", self.styles2FirstChange_runOnce0);
	self.linksUnderlineEnabledEl.removeEventListener("click", self.styles2FirstChange_runOnce0);
	};

	this.fullZoomRangeEl=this.document.getElementById("fullZoomRange");
	this.fullZoomRangeEl.addEventListener("input", fullZoomRange_input.bind(this));
	this.fullZoomRangeEl.addEventListener("input", this.zoomfFirstChange_runOnce0);

	this.fullZoomEl=this.document.getElementById("fullZoom");
	this.fullZoomEl.addEventListener("input", fullZoom_input.bind(this));
	this.fullZoomEl.addEventListener("input", this.zoomfFirstChange_runOnce0);

	this.fullZoomUseDefaultEl=this.document.getElementById("fullZoomUseDefault");
	this.fullZoomUseDefaultEl.addEventListener("click", fullZoomUseDefault_click.bind(this));
	this.fullZoomUseDefaultEl.addEventListener("click", this.zoomfFirstChange_runOnce0);

	this.textZoomRangeEl=this.document.getElementById("textZoomRange");
	this.textZoomRangeEl.addEventListener("input", textZoomRange_input.bind(this));
	this.textZoomRangeEl.addEventListener("input", this.zoomtFirstChange_runOnce0);

	this.textZoomEl=this.document.getElementById("textZoom");
	this.textZoomEl.addEventListener("input", textZoom_input.bind(this));
	this.textZoomEl.addEventListener("input", this.zoomtFirstChange_runOnce0);

	this.textZoomUseDefaultEl=this.document.getElementById("textZoomUseDefault");
	this.textZoomUseDefaultEl.addEventListener("click", textZoomUseDefault_click.bind(this));
	this.textZoomUseDefaultEl.addEventListener("click", this.zoomtFirstChange_runOnce0);


	this.textColorEnabledEl=this.document.getElementById("textColorEnabled");
	this.textColorEnabledEl.addEventListener("click", textColorEnabled_click.bind(this));
	this.textColorEnabledEl.addEventListener("click", this.styles1FirstChange_runOnce0);

	this.textColorEl=this.document.getElementById("textColor");
	this.textColorEl.addEventListener("input", textColor_input.bind(this));
	this.textColorEl.addEventListener("input", this.styles1FirstChange_runOnce0);

	this.backgroundColorEnabledEl=this.document.getElementById("backgroundColorEnabled");
	this.backgroundColorEnabledEl.addEventListener("click", backgroundColorEnabled_click.bind(this));
	this.backgroundColorEnabledEl.addEventListener("click", this.styles1FirstChange_runOnce0);

	this.backgroundColorEl=this.document.getElementById("backgroundColor");
	this.backgroundColorEl.addEventListener("input", backgroundColor_input.bind(this));
	this.backgroundColorEl.addEventListener("input", this.styles1FirstChange_runOnce0);

	this.imageBackgroundEnabledEl=this.document.getElementById("imageBackgroundEnabled");
	this.imageBackgroundEnabledEl.addEventListener("click", imageBackgroundEnabled_click.bind(this));
	this.imageBackgroundEnabledEl.addEventListener("click", this.styles1FirstChange_runOnce0);


	this.linksUnvisitedEnabledEl=this.document.getElementById("linksUnvisitedEnabled");
	this.linksUnvisitedEnabledEl.addEventListener("click", linksUnvisitedEnabled_click.bind(this));
	this.linksUnvisitedEnabledEl.addEventListener("click", this.styles2FirstChange_runOnce0);

	this.linksUnvisitedEl=this.document.getElementById("linksUnvisited");
	this.linksUnvisitedEl.addEventListener("input", linksUnvisited_input.bind(this));
	this.linksUnvisitedEl.addEventListener("input", this.styles2FirstChange_runOnce0);

	this.linksVisitedEnabledEl=this.document.getElementById("linksVisitedEnabled");
	this.linksVisitedEnabledEl.addEventListener("click", linksVisitedEnabled_click.bind(this));
	this.linksVisitedEnabledEl.addEventListener("click", this.styles2FirstChange_runOnce0);

	this.linksVisitedEl=this.document.getElementById("linksVisited");
	this.linksVisitedEl.addEventListener("input", linksVisited_input.bind(this));
	this.linksVisitedEl.addEventListener("input", this.styles2FirstChange_runOnce0);

	this.linksUnderlineEnabledEl=this.document.getElementById("linksUnderlineEnabled");
	this.linksUnderlineEnabledEl.addEventListener("click", linksUnderlineEnabled_click.bind(this));
	this.linksUnderlineEnabledEl.addEventListener("click", this.styles2FirstChange_runOnce0);


	this.document.getElementById("ok").addEventListener("click", ok_click.bind(this));
	this.document.getElementById("globalSettings").addEventListener("click", globalSettings_click.bind(this));

	if ((this.mytab_lb.hasunsavedzoomf == true) || (this.mytab_lb.hasunsavedzoomt == true) || (this.mytab_lb.hasunsavedstyle1 == true) || (this.mytab_lb.hasunsavedstyle2 == true)){
	var stringBundle = Services.strings.createBundle('chrome://zoomlevel/locale/overlay.properties?' + Math.random());
	this.document.getElementById("cancel").textContent = stringBundle.GetStringFromName("buttonCancelR.textContent");
	if (this.mytab_lb.hasunsavedzoomf == true)
		this.labelFullzoom.setAttribute("style","color:brown;");
	if (this.mytab_lb.hasunsavedzoomt == true)
		this.labelTextzoom.setAttribute("style","color:brown;");
	if (this.mytab_lb.hasunsavedstyle1 == true)
		this.stytle1.setAttribute("style","color:brown;");
	if (this.mytab_lb.hasunsavedstyle2 == true)
		this.stytle2.setAttribute("style","color:brown;");
	}

	this.panel.iframe.addEventListener('keydown',panelkeyhandler.bind(this),true);

	this.document.getElementById("siteURL").textContent = this.site;

	var [textLevel, fullLevel] = prefController.getZoomForSiteWithDefaults(this.site, this.isPrivate);
	var styles = prefController.getStyleForSite(this.site, this.isPrivate);

	this.fullZoomEl.value = fullLevel;
	this.fullZoomRangeEl.value = fullLevel;
	this.textZoomEl.value = textLevel;
	this.textZoomRangeEl.value = textLevel;

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

	//var OS = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
	//if(true) {//OS == "Linux"
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
	//}
	//this.panel.iframe.focus();
	
Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser").addEventListener('keyup',this.winkeyhandler);
}

function zoomfFirstChange (){
	this.labelFullzoom.setAttribute("style","color:green;");
	this.labelTextzoom.setAttribute("style","color:green;");
	this.mytab_lb.hasunsavedzoomf = true;
}
function zoomtFirstChange (){
	this.labelFullzoom.setAttribute("style","color:green;");
	this.labelTextzoom.setAttribute("style","color:green;");
	this.mytab_lb.hasunsavedzoomt = true;
}

function styles1FirstChange (){
	this.stytle1.setAttribute("style","color:green;");
	this.stytle2.setAttribute("style","color:green;");
	this.mytab_lb.hasunsavedstyle1 = true;
}
function styles2FirstChange (){
	this.stytle1.setAttribute("style","color:green;");
	this.stytle2.setAttribute("style","color:green;");
	this.mytab_lb.hasunsavedstyle2 = true;
}

function fullZoomRange_input() {
	var fullZoomValue = this.fullZoomRangeEl.value;
	this.fullZoomEl.value = fullZoomValue;
	this.previewZoom();
}

function fullZoom_input() {
	var fullZoomValue = this.fullZoomEl.value;
	this.fullZoomRangeEl.value = fullZoomValue;
	this.previewZoom();
}

function fullZoomUseDefault_click() {
	var [textLevel, fullLevel] = prefController.getZoomDefaults(this.site);
	this.fullZoomEl.value = fullLevel;
	this.fullZoomRangeEl.value = fullLevel;
	this.previewZoom();
}

function textZoomRange_input() {
	var textZoomValue = this.textZoomRangeEl.value;
	this.textZoomEl.value = textZoomValue;
	this.previewZoom();
}

function textZoom_input() {
	var textZoomValue = this.textZoomEl.value;
	this.textZoomRangeEl.value = textZoomValue;
	this.previewZoom();
}

function textZoomUseDefault_click() {
	var [textLevel, fullLevel] = prefController.getZoomDefaults(this.site);
	this.textZoomEl.value = textLevel;
	this.textZoomRangeEl.value = textLevel;
	this.previewZoom();
}

function textColorEnabled_click() {
	var isEnabled = this.textColorEnabledEl.checked;
	this.textColorEl.disabled = !isEnabled;
	this.previewStyle();
}

function textColor_input() {
	this.previewStyle();
}

function backgroundColorEnabled_click() {
	var isEnabled = this.backgroundColorEnabledEl.checked;
	this.backgroundColorEl.disabled = !isEnabled;
	this.previewStyle();
}

function backgroundColor_input() {
	this.previewStyle();
}

function imageBackgroundEnabled_click() {
	this.previewStyle();
}

function linksUnvisitedEnabled_click() {
	var isEnabled = this.linksUnvisitedEnabledEl.checked;
	this.linksUnvisitedEl.disabled = !isEnabled;
	this.previewStyle();
}

function linksUnvisited_input() {
	this.previewStyle();
}

function linksVisitedEnabled_click() {
	var isEnabled = this.linksVisitedEnabledEl.checked;
	this.linksVisitedEl.disabled = !isEnabled;
	this.previewStyle();
}

function linksVisited_input() {
	this.previewStyle();
}

function linksUnderlineEnabled_click() {
	this.previewStyle();
}

function panelkeyhandler(event) {
	if (event.isComposing || event.keyCode === 229) return;
	if (event.code == 'Escape') {
	if (event.target.className == 'minicolor minicolors-input') this.colorpanelcanbeopened = true;
	} else if (event.code == 'KeyS') event.preventDefault();
}

function ok_click() {
	this.save();
	this.close();
}

function cancel_click() {
	this.revert();
	this.close();
}

function close_click() {
	viewManager.updateIndicator(this.mytab_lb);
	this.close();
}

function globalSettings_click() {
	var globalSettingsDialog = new GlobalSettingsDialog();
	globalSettingsDialog.open();
	this.close();
}

export function SiteSettingsDialog() {
	var self = this;
	this.mytab_lb = getgBrowser().selectedBrowser;
	this.panel = new Panel(null, {
		contentURL: "chrome://zoomlevel/content/lib/siteSettings.xhtml"
	});

	//bindedwinkeyhandler = winkeyhandler.bind(this);
	this.winkeyhandler = function(event) {
		if (event.isComposing || event.keyCode === 229) return;
		if (event.code == 'Escape'){
			if (self.colorpanelcanbeopened == true) self.colorpanelcanbeopened = false;
			else close_click.bind(self)();
		} else if (event.code == 'KeyS'){
			ok_click.bind(self)();
		} else if (event.code == 'KeyR'){
			cancel_click.bind(self)();
		}
	}

	this.panel.iframe.addEventListener("DOMContentLoaded", init.bind(this));
}

SiteSettingsDialog.prototype = {
	open: function () {
		this.panel.open();
	},

	close: function () {
		//this.panel.iframe.removeEventListener('keydown',???);
	
Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser").removeEventListener('keyup',this.winkeyhandler);
		this.panel.close();
		this.panel.destroy();
	},

	revert: function () {
		var zoom = prefController.getZoomForSiteWithDefaults(this.site, this.isPrivate);
		var style = prefController.getStyleForSiteWithDefaults(this.site, this.isPrivate);
		viewManager.setCurrentTabZoom(zoom);
		viewManager.setTabStyle(this.mytab_lb, style);
		//this.mytab_lb.hasunsavedzoom = false;
		//this.mytab_lb.hasunsavedstyle1 = false;
		//this.mytab_lb.hasunsavedstyle2 = false;
	},

	previewZoom: function () {
		var zoom = this.getZoom();
		viewManager.setCurrentTabZoomTemp(zoom);
	},

	previewStyle: function () {
		var style = this.getStyle();
		if (prefController.excludedSites.indexOf(this.site) === -1) {
			style = prefController.applyStyleGlobals(style);
		}
		viewManager.setTabStyleTemp(this.mytab_lb, style);
		//this.mytab_lb.hasunsavedstyle = true;
	},

	getZoom: function () {
		var textLevel = +this.textZoomEl.value;
		var fullLevel = +this.fullZoomEl.value;
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
		//this.mytab_lb.hasunsavedzoom = false;
		//this.mytab_lb.hasunsavedstyle1 = false;
		//this.mytab_lb.hasunsavedstyle2 = false;
	}
};