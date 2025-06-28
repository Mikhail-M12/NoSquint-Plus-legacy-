//var EXPORTED_SYMBOLS = ["ContextMenu"];

const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

export var ContextMenu = {
	add: function (win, attrs) {
		var menuItem = win.document.createElementNS(NS_XUL, "menuitem");
		menuItem.setAttribute("id", attrs.id);
		menuItem.setAttribute("label", attrs.label);
		menuItem.setAttribute("class", "menuitem-iconic");
		menuItem.addEventListener("command", attrs.onCommand, true);

		var contextMenu = win.document.getElementById("contentAreaContextMenu");
		contextMenu.appendChild(menuItem);
	},
	remove: function (win, id) {
		var menuItem = win.document.getElementById(id);
		if (menuItem) {
			menuItem.parentNode.removeChild(menuItem);
		}
	}
};