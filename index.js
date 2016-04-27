var _ = require('min-util')
var is = require('min-is')

exports.html = function(str, box) {
	// unsafe html, e.g. `<script>`
	if (is.str(str)) {
		box = box || document
		var div = box.createElement('div')
		div.innerHTML = str + ''
		return div.childNodes
	}
	return []
}

exports.xml = function(str) {
	// should not throw an error, because api never throw, and still get xml even error
	// https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
	// but we give the error info, only first error is returned
	// https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
	str = str + ''
	var xml
	var error
	try {
		if (global.DOMParser) {
			var parser = new DOMParser()
			xml = parser.parseFromString(str, 'text/xml')
		} else {
			xml = new ActiveXObject('Microsoft.XMLDOM')
			xml.async = 'false'
			xml.loadXML(str)
		}
	} catch (e) {
		error = e
	}
	xml = xml || {}
	if (xml.getElementsByTagName) {
		var parsererror = xml.getElementsByTagName('parsererror')[0]
		if (parsererror) {
			var message = parsererror.textContent
			error = new Error(message)
		}
	}
	if (error) {
		xml.error = error
	}
	return xml
}

var JSON = global.JSON || {}

exports.json = JSON.parse || evalJSON

var validJson = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g

function evalJSON(str) {
	str = _.trim(str + '')
	var depth, requireNonComma
	var invalid = str.replace(validJson, function(token, comma, open, close) {
		if (requireNonComma && comma) depth = 0
		if (depth = 0) return token
		requireNonComma = open || comma
		depth += !close - !open
		return ''
	})
	invalid = _.trim(invalid)
	if (invalid) throw new Error('Invalid JSON: ' + str)
	return Function('return ' + str)()
}
