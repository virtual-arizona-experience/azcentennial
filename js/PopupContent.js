var jade = require("jade");

function PopupContent(templateUrl, contextFn, options) {
	var that = this;
	
	this.options = options || {};
	this.jadeFn = null;
	this.context = contextFn;
	$.ajax({
		url: templateUrl,
		async: false,
		success: function(result) { that.jadeFn = jade.compile(result); }
	});
}

PopupContent.prototype.generatePopupContent = function(feature) {
	return this.jadeFn(this.context(feature));
};