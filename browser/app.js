var parse = require('../')

var xmlErrorStr = `
<a>
	<b b="b"></b>
	<c c=c></c>
</a>
`

var xmlOKStr = `
<a>
	<b b="b"></b>
	<c c="c"></c>
</a>
`

test(xmlErrorStr)
test(xmlOKStr)

function test(xmlStr) {
	var xml = parse.xml(xmlStr)
	console.log(xml)
	if (xml.error) {
		console.error(xml.error)
	}
}
