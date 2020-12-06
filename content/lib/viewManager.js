"use strict";

var EXPORTED_SYMBOLS = ["viewManager", "prefController"];

const Cu = Components.utils;

try{
	Cu.import("resource://gre/modules/Console.jsm"); 
}
catch(error){
	Cu.import("resource://gre/modules/"+"devtools"+"/Console.jsm");
}

Cu.import("chrome://zoomlevel/content/lib/utils.js");

var viewManager = {
    setCurrentTabZoom: function (zoom) {
        var selTab_lb = getgBrowser().selectedBrowser;
        var data = {
            textLevel: zoom[0],
            fullLevel: zoom[1]
        };
        selTab_lb.messageManager.sendAsyncMessage("zoomlevel-setZoom", data);
	selTab_lb.hasunsavedzoomf = false; selTab_lb.hasunsavedzoomt = false;
	this.updateIndicator(selTab_lb);
    },

    setCurrentTabStyle: function (style) {
        var selTab_lb = getgBrowser().selectedBrowser;
        this.setTabStyle(selTab_lb, style);
    },

    setTabZoom: function (tab_lb, zoom) {
        var data = {
            textLevel: zoom[0],
            fullLevel: zoom[1]
        };
        tab_lb.messageManager.sendAsyncMessage("zoomlevel-setZoom", data);
	tab_lb.hasunsavedzoomf = false; tab_lb.hasunsavedzoomt = false;
	if (tab_lb == getgBrowser().selectedBrowser)
		this.updateIndicator(tab_lb);
    },

    setTabStyle: function (tab_lb, style) {
        tab_lb.messageManager.sendAsyncMessage("zoomlevel-setStyle", style);
	tab_lb.hasunsavedstyle1 = false; tab_lb.hasunsavedstyle2 = false;
    },

    setTabStyleTemp: function (tab_lb, style) {
        tab_lb.messageManager.sendAsyncMessage("zoomlevel-setStyle", style);
    },

    setCurrentTabZoomTemp: function (zoom) {
        var selTab_lb = getgBrowser().selectedBrowser;
        this.setTabZoomTemp(selTab_lb, zoom);
    },

    resetTabZoomTemp: function (tab_lb) {
        var site = prefController.getSiteFromURI(tab_lb.currentURI)
        var [textLevel, fullLevel] = prefController.getZoomDefaults(site);
        this.setTabZoomTemp(tab_lb, [textLevel, fullLevel]);
        tab_lb.hasunsavedzoomf = true; tab_lb.hasunsavedzoomt = true;
    },

    setTabZoomTemp: function (tab_lb, zoom) {
        var data = {
            textLevel: zoom[0],
            fullLevel: zoom[1]
        };
        tab_lb.messageManager.sendAsyncMessage("zoomlevel-setZoom", data);
    },

    normalizeTab: function (tab_lb) {
        this.setTabZoom(tab_lb, [100, 100]);
        this.setTabStyle(tab_lb, {});
    },

    setSiteZoom: function (site, zoom, isPrivate) {
        var self = this;
        iterTabs(function (tab_lb) {
            var tabSite = prefController.getSiteFromURI(tab_lb.currentURI);
            if (tabSite === site && isTabPrivate(tab_lb) == isPrivate) {
                self.setTabZoom(tab_lb, zoom);
            }
        });
    },

    setSiteStyle: function (site, style, isPrivate) {
        var self = this;
        iterTabs(function (tab_lb) {
            var tabSite = prefController.getSiteFromURI(tab_lb.currentURI);
            if (tabSite === site && isTabPrivate(tab_lb) == isPrivate) {
                self.setTabStyle(tab_lb, style);
            }
        });
    },

    updateAll: function () {
        var self = this;
        iterTabs(function (tab_lb) {
            if (prefController.isChrome(tab_lb.currentURI)) {
                //return;
            }
            var tabSite = prefController.getSiteFromURI(tab_lb.currentURI);
            if (prefController.excludedSites.indexOf(tabSite) !== -1) {
                return;
            }
            var zoom = prefController.getZoomForSiteWithDefaults(tabSite, isTabPrivate(tab_lb));
            self.setTabZoom(tab_lb, zoom);
            var style = prefController.getStyleForSiteWithDefaults(tabSite, isTabPrivate(tab_lb));
            self.setTabStyle(tab_lb, style);
        });
    },

    normalizeAll: function () {
        var self = this;
        iterTabs(function (tab_lb) {
            self.normalizeTab(tab_lb);
        });
    },
	
	updateIndicator:function(tab_lb){
		//if (tab_lb == getgBrowser().selectedBrowser) {
			var document = tab_lb.ownerDocument;
			if(document.getElementById("zoomlevel-indicator")){
				var isPrivate = isTabPrivate(tab_lb);
				var site = prefController.getSiteFromURI(tab_lb.currentURI);
				var zoom = prefController.getZoomForSiteWithDefaults(site, isPrivate);
				//var style = prefController.getStyleForSiteWithDefaults(site, isPrivate);
				var symbf = (tab_lb.hasunsavedzoomf == true) ? "?" : "%";
				var symbt = (tab_lb.hasunsavedzoomt == true) ? "?" : "%";
				if(zoom[0] == zoom[1]) {
					var symbs = symbf;
					if (symbs == "?") symbs += symbt;
					else if (symbt == "?") symbs += symbt;
					document.getElementById("zoomlevel-indicator").setAttribute("value",zoom[0] + symbs);
				} else document.getElementById("zoomlevel-indicator").setAttribute("value",zoom[1] + symbf +"/" +  zoom[0] + symbt);
			}
		//}
	},	
	
    updateToolbarButton: function () {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator("navigator:browser");

		// Check each browser instance for our URL
		while (browserEnumerator.hasMoreElements()) {
			var browserWin = browserEnumerator.getNext();
			if(!prefController.branchNS.getBoolPref("zoomIndicatorsEnabled")) {
				//browserWin.document.getElementById("zoomlevel-indicator").classList.add("hiddenlabel");
				browserWin.document.getElementById("zoomlevel-indicator-box").setAttribute("hidden", "true");
			}
			else {
				//browserWin.document.getElementById("zoomlevel-indicator").classList.remove("hiddenlabel");
				browserWin.document.getElementById("zoomlevel-indicator-box").setAttribute("hidden", "false");
			}
		}
    }
};

var prefController = {
    defaultColors: {
        textColor: "#000000",
        backgroundColor: "#ffffff",
        linksUnvisited: "#0000ee",
        linksVisited: "#551a8b"
    },

    ignoreNextSitesChange: false,

    preload: function () {
        // Pref service.
        var svc = Components.classes["@mozilla.org/preferences-service;1"].getService(
            Components.interfaces.nsIPrefService);
        svc.QueryInterface(Components.interfaces.nsIPrefBranch);
        this.svc = svc;

        // Pref Branches we"re interested in.
        this.branchNS = svc.getBranch("extensions.zoomlevel.");

        // Attach observers to both branches.
        this.branchNS.QueryInterface(Components.interfaces.nsIPrefBranch);
        this.branchNS.addObserver("", this, false);

        // Initialize preferences in this order; some of them require
        // other prefs have been loaded.  (e.g. forgetMonths needs
        // rememberSites)
        var prefs = [
            "sites", "fullZoomLevel", "textZoomLevel", "zoomIncrement", "wheelZoomEnabled",
            "rememberSites", "exceptions", "forgetMonths",
            "fullZoomPrimary", "textColor", "backgroundColor",
            "imageBackground", "linksUnvisited", "linksVisited", "linksUnderline", "excludedSites", "zoomIndicatorsEnabled"
        ];

        for (let pref of iter(prefs)) {
            // Simulate pref change for each pref to populate attributes
            this.observe(null, "nsPref:changed", pref);
        }
    },

    observe: function (subject, topic, data) {
        if (topic != "nsPref:changed") {
            // Not a pref change.
            return;
        }

        switch (data) {
            case "fullZoomLevel":
                this.fullZoomLevel = this.branchNS.getIntPref("fullZoomLevel");
                break;

            case "textZoomLevel":
                this.textZoomLevel = this.branchNS.getIntPref("textZoomLevel");
                break;

            case "wheelZoomEnabled":
                this.wheelZoomEnabled = this.branchNS.getBoolPref("wheelZoomEnabled");
                break;

            case "zoomIncrement":
                this.zoomIncrement = this.branchNS.getIntPref("zoomIncrement");
                break;

            case "forgetMonths":
                this.forgetMonths = this.branchNS.getIntPref("forgetMonths");
                this.pruneSites();
                break;

            case "fullZoomPrimary":
                this.fullZoomPrimary = this.branchNS.getBoolPref("fullZoomPrimary");
                break;

            case "rememberSites":
                this.rememberSites = this.branchNS.getBoolPref("rememberSites");
                this.pruneSites();
                break;

            case "exceptions":
                // Parse exceptions list from prefs
                this.exceptions = this.parseExceptions(this.branchNS.getCharPref("exceptions"));
                break;

            case "sites":
                if (this.ignoreNextSitesChange) {
                    this.ignoreNextSitesChange = false;
                    break;
                }
                this.sites = this.parseSites(this.branchNS.getCharPref("sites"));
                break;

            case "textColor":
                this.textColor = this.branchNS.getCharPref("textColor");
                break;

            case "backgroundColor":
                this.backgroundColor = this.branchNS.getCharPref("backgroundColor");
                break;

            case "imageBackground":
                this.imageBackground = this.branchNS.getBoolPref("imageBackground");
                break;

            case "linksUnvisited":
                this.linksUnvisited = this.branchNS.getCharPref("linksUnvisited");
                break;

            case "linksVisited":
                this.linksVisited = this.branchNS.getCharPref("linksVisited");
                break;

            case "linksUnderline":
                this.linksUnderline = this.branchNS.getBoolPref("linksUnderline");
                break;

            case "excludedSites":
                this.excludedSites = this.branchNS.getCharPref("excludedSites").split(" ");
                break;
				
            case "zoomIndicatorsEnabled":
                this.zoomIndicatorsEnabled = this.branchNS.getBoolPref("zoomIndicatorsEnabled");
                break;				
        }
    },

    /* Parses sites pref into sites array.
     */
    parseSites: function (sitesStr) {
        /* Parse site list from prefs.  The prefs string a list of site specs,
         * delimited by a space, in the form:
         *
         *     sitename=text_level,timestamp,visits,full_level,textcolor,bgcolor,
         *              nobgimages,linkunvis,linkvis,linkunderline
         *
         * Spaces are not allowed in any value; sitename is a string, all other
         * values are integers.  The parsing code tries to be robust and handle
         * malformed entries gracefully (in case the user edits them manually
         * and screws up).  Consequently it is ugly.
         */
        var sites = {};
        // Trim whitespace and split on space.
        var sitesList = sitesStr.replace(/(^\s+|\s+$)/g, "").split(" ");
        var now = new Date().getTime();

        for (let defn of iter(sitesList)) {
            var parts = defn.split("=");
            if (parts.length != 2)
                continue; // malformed
            var [site, info] = parts;
            var parts = info.split(",");
            sites[site] = [parseInt(parts[0]) || 0, now, 1, 0, "0", "0", false, "0", "0", false];
            if (parts.length > 1) // last visited timestamp
                sites[site][1] = parseInt(parts[1]) || now;
            if (parts.length > 2) // visit count
                sites[site][2] = parseInt(parts[2]) || 1;
            if (parts.length > 3) // full page zoom level
                sites[site][3] = parseInt(parts[3]) || 0;
            if (parts.length > 4) // text color
                sites[site][4] = parts[4] || "0";
            if (parts.length > 5) // bg color
                sites[site][5] = parts[5] || "0";
            if (parts.length > 6) // disable bg images
                sites[site][6] = parts[6] === "true";
            if (parts.length > 7) // unvisited link color
                sites[site][7] = parts[7] || "0";
            if (parts.length > 8) // visited link color
                sites[site][8] = parts[8] || "0";
            if (parts.length > 9) // force underline links
                sites[site][9] = parts[9] === "true";

        }
        return sites;
    },

    /* Takes an array of exceptions as stored in prefs, and returns a sorted
     * list, where each exception is converted to a regexp grammar.  The list
     * is sorted such that exceptions with the most literal (non-wildcard)
     * characters are first.
     */
    parseExceptions: function (exStr) {
        // Trim the space-delimited exceptions string and convert to array.
        var exlist = exStr.replace(/(^\s+|\s+$)/g, "").split(" ");

        /* This ugly function takes an exception, with our custom
         * grammar, and converts it to a regular expression that we can
         * match later.  Hostname and path components are processed in
         * separate calls; re_star and re_dblstar define the regexp syntax
         * for * and ** wildcards for this pattern.  (This is because
         * wildcards have different semantics for host vs path.)
         *
         * Function returns a list of [length, pattern, sub] where length
         * is the number of literal (non-wildcard) characters, pattern is
         * the regexp that will be used to match against the URI, and sub is
         * used (via regexp.replace) to create the site name based on the
         * URI.
         */
        function regexpify(pattern, re_star, re_dblstar) {
            var parts = pattern.split(/(\[\*+\]|\*+)/);
            pattern = [];
            var sub = [];
            var length = 0;

            // Maps wildcards in custom grammar to regexp equivalent.
            var wildcards = {
                "*": "(" + re_star + ")",
                "**": "(" + re_dblstar + ")",
                "[*]": re_star,
                "[**]": re_dblstar
            };

            var group = 1;
            for (let part of iter(parts)) {
                if (part == "")
                    continue;
                if (wildcards[part])
                    pattern.push(wildcards[part]);
                else {
                    length += part.length;
                    pattern.push("(" + part + ")");
                }

                if (part[0] == "[")
                    sub.push(part.slice(1, -1));
                else
                    sub.push("$" + group++);
            }
            return [length, pattern.join(""), sub.join("")];
        }

        var exceptions = [];
        for (var origexc of iter(exlist)) {
            if (!origexc)
                continue;
            // Escape metacharacters except *
            var exc = origexc.replace(/([^\w:*\[\]])/g, "\\$1");
            // Split into host and path parts, and regexpify separately.
            var [_, exc_host, exc_path] = exc.match(/([^\/]*)(\\\/.*|$)/);
            var [len_host, re_host, sub_host] = regexpify(exc_host, "[^.:/]+", ".*");
            var [len_path, re_path, sub_path] = regexpify(exc_path, "[^/]+", ".*");
            if (exc_host.search(":") === -1) {
                re_host += "(:\\d+)";
            }

            exceptions.push([origexc, len_host * 1000 + len_path, exc_host, re_host, sub_host, re_path, sub_path]);
        }
        // Sort the exceptions such that the ones with the highest weights
        // (that is, the longest literal lengths) appear first.
        exceptions.sort(function (a, b) {
            return b[1] - a[1];
        });
        return exceptions;
    },

    /* Called in order to remove remembered values for sites we haven"t visited in forgetMonths.
     */
    pruneSites: function () {
        if (!this.rememberSites) {
            this.ignoreNextSitesChange = true;
            this.branchNS.setCharPref("sites", "");
            return;
        }

        if (this.forgetMonths == 0)
            return;

        var remove = [];
        var now = new Date();
        for (let [site, settings] of items(this.sites)) {
            if (!settings) {
                continue;
            }

            var [text, timestamp, counter, full] = settings;
            var age = now - new Date(timestamp);
            var prune = (age > this.forgetMonths * 30 * 24 * 60 * 60 * 1000);
            if (prune) {
                remove.push(site);
            }
        }
        if (remove.length) {
            for (let site of iter(remove)) {
                delete this.sites[site];
            }
            this.queueSaveSiteList();
        }
    },

    /* Returns a 2-tuple [text_default, full_default] representing the default
     * zoom levels.
     */
    getZoomDefaults: function (site) {
        if (!site || site.substr(0, 6) == "about:" || this.excludedSites.indexOf(site) !== -1)
            return [100, 100];
        return [this.textZoomLevel, this.fullZoomLevel];
    },

    /* Gets the zoom levels for the given site name.  (Note, this is the site
     * name as gotten from getSiteFromURI(), not the URI itself.)  Returns a
     * 2-tuple [text_size, full_size], or [null, null] if the site is not
     * found.  (This signifies to the caller to use the default zoom.)
     */
    getZoomForSite: function (site, isPrivate) {
        var siteSettings;

        if (site) {
            if (isPrivate && this.privateSites) {
                siteSettings = this.privateSites[site];
            } else {
                siteSettings = this.sites[site];
            }
        }

        if (siteSettings) {
            return [siteSettings[0], siteSettings[3]];
        }

        return [null, null];
    },

    getZoomForSiteWithDefaults: function (site, isPrivate) {
        var [text, full] = this.getZoomForSite(site, isPrivate);
        var [text_default, full_default] = this.getZoomDefaults(site);
        return [text || text_default, full || full_default];
    },

    /* Applies global styles to the given style object.  Attributes that have
     * no site-local or global value are null.
     */
    applyStyleGlobals: function (style) {
        var newstyle = {enabled: false};
        var boolDefaults = {imageBackground: false, linksUnderline: false};
        var isDefault = function (o, attr) {
            return !o || !o[attr] || o[attr] in ["0", false];
        };
        for (let [key, value] of items(this.defaultColors, boolDefaults)) {
            newstyle[key] = isDefault(style, key) ? (isDefault(this, key) ? null : this[key]) : style[key];
            newstyle.enabled = newstyle.enabled || !!newstyle[key];
        }
        return newstyle;
    },

    /* Gets the style parameters for the given site name.  Returns null if
     * the site has no settings.
     */
    getStyleForSite: function (site, isPrivate) {
        var siteSettings;

        if (site) {
            if (isPrivate && this.privateSites) {
                siteSettings = this.privateSites[site];
            } else {
                siteSettings = this.sites[site];
            }
        }

        if (siteSettings) {
            return {
                textColor: siteSettings[4],
                backgroundColor: siteSettings[5],
                imageBackground: siteSettings[6],
                linksUnvisited: siteSettings[7],
                linksVisited: siteSettings[8],
                linksUnderline: siteSettings[9]
            };
        }
        return null;
    },

    getStyleForSiteWithDefaults: function (site, isPrivate) {
        var style = this.getStyleForSite(site, isPrivate);
        //if (typeof this.excludedSites !== 'undefined')
        if (this.excludedSites.indexOf(site) !== -1) {
            return style;
        } else {
            return this.applyStyleGlobals(style);
        }
        //return style;
    },

    isSiteRecordDefault: function (record) {
        return [record[0]].concat(record.slice(3)).toString() == [0, 0, "0", "0", false, "0", "0", false].toString();
    },

    zoomInSite: function (site, isSecondaryZoom, isPrivate, incMultiplier = 1) {
        var zoom = this.getZoomForSiteWithDefaults(site, isPrivate);
        var zoomstep = this.zoomIncrement * incMultiplier;
        if (this.fullZoomPrimary === !!isSecondaryZoom) {
            zoom[0] = zoom[0] + zoomstep;
        } else {
            zoom[1] = zoom[1] + zoomstep;
        }
        this.updateSiteList(site, zoom, null, isPrivate);
    },

    zoomInSitePositive: function (site, isSecondaryZoom, isPrivate, incMultiplier = 1) {
	if (this.zoomIncrement > 0) this.zoomInSite(site, isSecondaryZoom, isPrivate, incMultiplier);
	else this.zoomInSite(site, isSecondaryZoom, isPrivate, -1 * incMultiplier);
    },

    zoomOutSite: function (site, isSecondaryZoom, isPrivate, incMultiplier = 1) {
        var zoom = this.getZoomForSiteWithDefaults(site, isPrivate);
        var zoomstep = this.zoomIncrement * incMultiplier;
        if (this.fullZoomPrimary === !!isSecondaryZoom) {
            zoom[0] = zoom[0] - zoomstep;
        } else {
            zoom[1] = zoom[1] - zoomstep;
        }
        this.updateSiteList(site, zoom, null, isPrivate);
    },

    zoomOutSitePositive: function (site, isSecondaryZoom, isPrivate, incMultiplier = 1) {
	if (this.zoomIncrement > 0) this.zoomOutSite(site, isSecondaryZoom, isPrivate, incMultiplier);
	else this.zoomOutSite(site, isSecondaryZoom, isPrivate, -1 * incMultiplier);
    },

    zoomResetSite: function (site, isPrivate) {
        var zoom = this.getZoomDefaults(site);
        this.updateSiteList(site, zoom, null, isPrivate);
    },

    /* Updates the site list for the given site name to set the given levels
     * (2-tuple of [text, full]), and then queues a site list save.
     */
    updateSiteList: function (site, levels, style, isPrivate) {
        if (!site) {
            return;
        }

        if (isPrivateTabOpen()) {
            if (!this.privateSites) {
                //clone values
                this.privateSites = JSON.parse(JSON.stringify(this.sites));
            }
        } else {
            if (this.privateSites) {
                delete this.privateSites;
            }
        }

        var sites = isPrivate ? this.privateSites : this.sites;

        if (!sites[site]) {
            // new site record, initialize to defaults.
            sites[site] = [0, new Date().getTime(), 1, 0, "0", "0", false, "0", "0", false];
        }
        var record = sites[site];
        var isExcluded = this.excludedSites.indexOf(site) !== -1;

        if (levels) {
            // Update record with specified levels.
            var [text_default, full_default] = this.getZoomDefaults(site);
            var [text, full] = levels;
            // Default zooms are stored as 0, not for excluded sites
            if (isExcluded) {
                record[0] = text;
                record[3] = full;
            } else {
                record[0] = text === text_default ? 0 : text;
                record[3] = full === full_default ? 0 : full;
            }
            viewManager.setSiteZoom(site, levels, isPrivate);
        }
        if (style) {
            record[4] = style.textColor || "0";
            record[5] = style.backgroundColor || "0";
            record[6] = style.imageBackground;
            record[7] = style.linksUnvisited || "0";
            record[8] = style.linksVisited || "0";
            record[9] = style.linksUnderline;

            if (!isExcluded) {
                style = this.applyStyleGlobals(style);
            }

            viewManager.setSiteStyle(site, style, isPrivate);
        }

        // Check newly updated record against defaults.  If all values are default, we
        // remove the record. Excluded sites save in all cases.
        if (!isExcluded && this.isSiteRecordDefault(record)) {
            delete sites[site];
        }

        if (!isPrivate) {
            this.queueSaveSiteList(true);
        }
    },

    /* Updates the last-accessed timestamp for the given site, and then
     * queues a site list save.
     */
    updateSiteTimestamp: function (site) {
        if (!site || !this.sites[site])
            return;
        if (this.isSiteRecordDefault(this.sites[site]))
            delete this.sites[site];
        else {
            this.sites[site][1] = new Date().getTime();
            this.sites[site][2] += 1;
        }
        // Save updated timestamp.  Timestamps are only updated on
        // the first page accessed for a given visit to that site,
        // so this shouldn't be too bad.
        this.queueSaveSiteList(false);
    },

    addExcludedSite: function (site) {
        if (this.excludedSites.indexOf(site) === -1) {
            this.excludedSites.push(site);
            this.saveAll();
            this.save();
        }
    },

    removeExcludedSite: function (site) {
        var index = this.excludedSites.indexOf(site);
        if (index !== -1) {
            this.excludedSites.splice(index, 1);
            this.saveAll();
            this.save();
        }
    },

    /* Queues a save of the site list in the prefs service.
     *
     * NOTE: This must only be called when the list has actually changed, or
     * else the next time a change is made in the Settings dialog, it will
     * be ignored.
     */
    queueSaveSiteList: function (flush) {
        this.saveSiteList(flush);
    },

    /* Store the sites list right now.  If flush is true, the prefs file is
     * committed to disk.
     */
    saveSiteList: function (flush) {
        if (!this.rememberSites) {
            return;
        }

        var sites = [];
        for (let [site, settings] of items(this.sites)) {
            if (!settings) {
                continue;
            }

            sites.push(site + "=" + settings.join(","));
        }

        /* We"re modifying the sites pref here.  Setting ignoreNextSitesChange=true
         * causes the observer (in our current state) to not bother reparsing the
         * sites pref because we know it"s current.  In other words, we needn"t
         * respond to our own changes.
         */
        this.ignoreNextSitesChange = true;
        this.branchNS.setCharPref("sites", sites.join(" "));
        if (flush) {
            this.save();
        }
    },

    saveAll: function (exceptions) {
        const intPrefs = [
            "fullZoomLevel", "textZoomLevel", "zoomIncrement", "forgetMonths"
        ];
        const boolPrefs = [
            "wheelZoomEnabled", "fullZoomPrimary", "rememberSites", "imageBackground", "linksUnderline", "zoomIndicatorsEnabled"
        ];
        const charPrefs = [
            "textColor", "backgroundColor", "linksUnvisited", "linksVisited"
        ];

        for (let pref of iter(intPrefs)) {
            this.branchNS.setIntPref(pref, this[pref]);
        }

        for (let pref of iter(boolPrefs)) {
            this.branchNS.setBoolPref(pref, this[pref]);
        }

        for (let pref of iter(charPrefs)) {
            this.branchNS.setCharPref(pref, this[pref]);
        }

        var excSitesStr = this.excludedSites.join(" ");
        this.branchNS.setCharPref("excludedSites", excSitesStr);

        if (exceptions) {
            var exStr = exceptions.join(" ");
            this.branchNS.setCharPref("exceptions", exStr);
            this.exceptions = this.parseExceptions(exStr);
        }

        viewManager.updateAll();
		
        viewManager.updateToolbarButton();
    },

    save: function () {
        return this.svc.savePrefFile(null);
    },

    /* Given a URI, returns the site name, as computed based on user-defined
     * exceptions.  If no exception matches the URI, we fall back to the base
     * domain name.
     */
    getSiteFromURI: function (URI) {
        if (!URI)
            return null;

        /* It"s a bit ugly to hard-code the "about" case here.  But make it
         * not-ugly would require some significant reworking of the site
         * name logic.
         */
        if (URI.scheme == "about")
        // Truncate path after non-word character (e.g. ?foo=bar is stripped)
            return URI.scheme + ":" + URI.pathQueryRef.replace(/\W.*$/, "");

        var uri_host = URI.asciiHost;
        var uri_path = URI.pathQueryRef;

        try {
            var uri_port = URI.port < 0 ? 0 : URI.port;
        } catch (err) {
            var uri_port = "0";
        }

        var base = getBaseDomainFromHost(uri_host);
        if (!base && !uri_host)
        // file:// url, use base as /
            base = "/";

        uri_host += ":" + uri_port;

        var match = null;

        /* Iterate over each exception, trying to match it with the URI.
         * We break the loop on the first match, because exceptions are
         * sorted with highest weights first.
         */
        for (let exc of iter(this.exceptions)) {
            var [_, weight, exc_host, re_host, sub_host, re_path, sub_path] = exc;
            if (re_host.substr(0, 11) == "([^.:/]+)(:") // exc_host == *[:...]
            // Single star is base name, so match just that, plus any port spec
            // that"s part of the exception.
                re_host = "(" + base + ")" + re_host.substr(9);

            var m1 = uri_host.match(new RegExp("(" + re_host + ")$"));
            var m2 = uri_path.match(new RegExp("^(" + re_path + ")"));

            if (!m1 || !m2)
            // No match
                continue;

            var site_host = m1[1].replace(new RegExp(re_host), sub_host);
            var site_path = m2[1].replace(new RegExp(re_path), sub_path);
            match = site_host + site_path;
            break;
        }

        return match ? match : base;
    },

    isChrome: function (URI) {
        return /^about:/.test(URI) || /^chrome:/.test(URI);
    }
};

prefController.preload();