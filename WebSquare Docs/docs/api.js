window.onload=doInit;

function doInit() {
	document.querySelectorAll('table#ptable > tbody > tr').forEach(function(tr, trCount) {
		  if (trCount == 0) return false;
		  tr.addEventListener('mouseenter', handleMouseEnter, false);
		  tr.addEventListener('mouseleave', handleMouseLeave, false);
	});

	document.querySelectorAll('xmp.description').forEach(function(element) {
		var l = element.innerHTML.split("\n");
		var str = [];
		var isTable = false;
		for (var o = 0; o < l.length; o++) {
			l[o] = trim(l[o]);
			if ( trim(l[o]) == "" ) continue;			
			var str1 = l[o];
			var str2 = "";
			var str3 = "";
			
			if (l[o].charAt(0) == '{') {
				var blockCount = 0;
				for (var idx1 = 0 ; idx1 < l[o].length ; idx1++ ) {
					if(l[o].charAt(idx1) == '{') {
						blockCount++;
					} else if(l[o].charAt(idx1) == '}') {
						blockCount--;
					}
					if(blockCount == 0) {
						break;
					}
				}
				
				str1 = l[o].substring(1, idx1);
				str2 = trim(l[o].substring(idx1 + 1));
				idx1 = str2.indexOf(" ");
				
				var idx2 = str2.indexOf("	");
				if (idx1 > idx2 && idx2 > 0) {
					idx1 = idx2;
				}
				if (idx1 > 0) {
					str3 = trim(str2.substring(idx1));
					str2 = trim(str2.substring(0,idx1));
					if( str2.charAt(str2.length-1) == ':' ) {
						str2 = trim(str2.substring(0, str2.length - 1));
					}
					if( str3.charAt(0) == ':' ) {
						str3 = trim(str3.substring(1));
					}
				}
				if (idx1 == -1) {
					str3 = " "
					str2 = trim(str2);
					if( str2.charAt(str2.length-1) == ':' ) {
						str2 = trim(str2.substring(0, str2.length - 1));
					}
				}
				if( o == 0 && str2 != "" && str3 != "" ) {
					isTable = true;
				}
			} else {
				str1 = "";
				str2 = trim(l[o]);
				idx1 = str2.indexOf(" ");
				var idx2 = str2.indexOf("	");
				if( idx1 > idx2 && idx2 > 0 ) {
					idx1 = idx2;
				}
				if( idx1 > 0 ) {
					str3 = trim(str2.substring(idx1));
					str2 = trim(str2.substring(0,idx1));
					if( str2.charAt(str2.length-1) == ':' ) {
						if( o == 0 ) isTable = true;
						str2 = trim(str2.substring(0, str2.length - 1));
					}
					if( str3.charAt(0) == ':' ) {
						if( o == 0 ) isTable = true;
						str3 = trim(str3.substring(1));
					}
				}
			}
			str.push([str1, str2, str3]);
		}
		
		if( isTable ) {
			var tableElement = document.createElement('table');
			tableElement.setAttribute('class', 'standardLighter');
			tableElement.setAttribute('cellpadding', '0');
			tableElement.setAttribute('cellspacing', '0');
			tableElement.setAttribute('border', '0');
			
			var cnt = 0;
			var thObj1 = document.createElement('th');
			var thObj2 = document.createElement('th');
			var thObj3 = document.createElement('th');
			var trObj = document.createElement("tr");
						
			thObj1.appendChild(document.createTextNode('property'));
			thObj2.appendChild(document.createTextNode('type'));
			thObj3.appendChild(document.createTextNode('description'));
			
			trObj.appendChild(thObj1);
			trObj.appendChild(thObj2);
			trObj.appendChild(thObj3);
			tableElement.appendChild(trObj);

			for (var o = 0; o < str.length; o++) {
				var trObj1 = document.createElement("tr");
				var tdObj1 = document.createElement("td");
				var tdObj2 = document.createElement("td");
				var tdObj3 = document.createElement("td");

				if( o % 2 == 0 ) {
					tdObj1.setAttribute('class', 'standardline alt');
					tdObj2.setAttribute('class', 'standardline alt');
					tdObj3.setAttribute('class', 'standardline alt');
				} else {
					tdObj1.setAttribute('class', 'standardline');
					tdObj2.setAttribute('class', 'standardline');
					tdObj3.setAttribute('class', 'standardline');
				}
				
				tdObj1.appendChild(document.createElement('span').appendChild(document.createTextNode(str[o][1])));
				tdObj2.appendChild(document.createElement('span').appendChild(document.createTextNode(str[o][0])));
				tdObj3.appendChild(document.createElement('span').appendChild(document.createTextNode(str[o][2])));
				
				trObj1.appendChild(tdObj1);
				trObj1.appendChild(tdObj2);
				trObj1.appendChild(tdObj3);
				tableElement.appendChild(trObj1);
			}
			
			element.parentNode.appendChild(tableElement);
			element.style.display="none";
		}
	});
}

function handleMouseEnter(e) {
	var target = e.target;
	target.classList.add('row-hover')
}

function handleMouseLeave(e) {
	var target = e.target;
	target.classList.remove('row-hover');
}

function trim(str) {
	if( typeof str == "undefined" && str == null ) return "";
	var leftTrimRegExp =  new RegExp("^\\s\\s*");
	var rightTrimRegExp = new RegExp("\\s\\s*$");
	str = str.replace(leftTrimRegExp, '').replace(rightTrimRegExp, '');
	return str;
}

function getParameter(param) {
	try {
		var _idx = location.search.indexOf("?");
		if( _idx >= 0 ) {
			var srch =location.search.substring(_idx+1);
			var arrayOfSrch = srch.split("&");
			for (var i=0; i < arrayOfSrch.length; i++) {
				var tmpArray = arrayOfSrch[i].split("=");
				if ( tmpArray.length == 2 && tmpArray[0] == param)	{
					if( tmpArray[1] == "" && typeof defaultValue != 'undefined') {
						return "";
					} else {
						return tmpArray[1];
					}
				}
			}
		}
	} catch( e ) {}
	return "";
}