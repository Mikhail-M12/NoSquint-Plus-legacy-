//js file load in each open tab
//has access to content, so we can change zoom and style only here

function onSetZoom(message) {
	const bc = this.content.docShell.browsingContext;
	var fullLevel = message.data.fullLevel;
	var textLevel = message.data.textLevel;
	bc.fullZoom = fullLevel / 100;
	bc.textZoom = textLevel / 100;
}

function onSetStyle(message) {	
	if('XULDocument' in content.document.defaultView) return;
	var styleElement = content.document.getElementById("zoomLevel-styles");
	if (!styleElement) {
		styleElement = content.document.createElementNS("http://www.w3.org/1999/xhtml", "style");
		styleElement.id = "zoomLevel-styles";
		if (content.document.head) {
			content.document.head.appendChild(styleElement);
		} else {
			var interval = content.window.setInterval(function () {
				if (content.document.head) {
					content.document.head.appendChild(styleElement);
					content.window.clearInterval(interval);
				}
			}, 20);
		}
	}
	var css = getCSSFromStyle(message.data);
	styleElement.textContent = css;
}

function getCSSFromStyle(style) {
	var css = "";
	if (style.textColor || style.backgroundColor || style.imageBackground) {
		css += "body,p,div,span,font,ul,li,center,blockquote,h1,h2,h3,h4,h5,table,tr,th,td,iframe,a,b,i {";
		if (style.textColor)
			css += "color: " + style.textColor + " !important;";
		if (style.backgroundColor)
			css += "background-color: " + style.backgroundColor + " !important;";
		if (style.imageBackground)
			css += "background-image: none !important;";
		css += "}\n";
	}

	if (style.linksUnvisited)
		css += "a:link { color: " + style.linksUnvisited + " !important; }\n";
	if (style.linksVisited)
		css += "a:visited { color: " + style.linksVisited + " !important; }\n";
	if (style.linksUnderline)
		css += "a { text-decoration: underline !important; }\n";

	return css;
}

addMessageListener("zoomlevel-setZoom", onSetZoom);
addMessageListener("zoomlevel-setStyle", onSetStyle);