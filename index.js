var _ = require('lodash')
var is = require('is')

exports.html = function(str, box) {
	// unsafe html, e.g. `<script>`
	if (is.string(str)) {
		box = box || document
		var div = box.createElement('div')
		div.innerHTML = str + ''
		return div.childNodes
	}
	return []
}

exports.xml = function(str) {
	str = str + ''
	var xml
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
		xml = undefined
	}
	if (xml && xml.documentElement) {
		if (!xml.getElementsByTagName('parsererror').length) {
			return xml
		}
	}
	throw new Error('Invalid XML: ' + str)
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
