// hintsnet 引思网专用库函数

// 定义 CJK 字符相关正则表达式
var regExpEn = "[a-zA-Z0-9]";
var regExpCJKIdeographs = "[㐀-\u4dbe一-\u9ffe]|[\ud840-\ud868\ud86a-\ud86c][\udc00-\udfff]|\ud869[\udc00-\udede\udf00-\udfff]|\ud86d[\udc00-\udf3e\udf40-\udfff]|\ud86e[\udc00-\udc1e]|[\ufa0e\ufa0f\ufa11\ufa13\ufa14\ufa1f\ufa21\ufa23\ufa24\ufa27-\ufa29]";
var regExpCJKSymbols = "[\u3000-〾]";

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

function hintPipeIsEqual(hintPipeA, hintPipeB) {
  if (hintPipeA["inPort"] === hintPipeB["inPort"] &&
    hintPipeA["outPort"] === hintPipeB["outPort"]) {
    return true;
  } else {
    return false;
  }
}

function hintPipeStr2JSON(hintPipeStr) {
  var portLabelPattern = regExpEn + "|" + regExpCJKIdeographs + "|" + regExpCJKSymbols;
  var hintPipePattern =
    "((" + portLabelPattern + ")+)" +
    "\\|->\\|" +
    "((" + portLabelPattern + ")+)";
  var hintPipeJSON = {};
  var regExpForhintPipe = new RegExp(hintPipePattern, "g");
  var regExpMatchResult = regExpForhintPipe.exec(hintPipeStr);

  if (regExpMatchResult != null) {
    hintPipeJSON = {
      "inPort": regExpMatchResult[1],
      "outPort": regExpMatchResult[3]
    };
  } else {;
  }
  return hintPipeJSON;
}

function hintPipesStr2JSONArray(hintPipesStr) {
  hintPipesStrArray = hintPipesStr.split('\n');
  var hintPipesJSONArray = [];
  for (hintPipeStr of hintPipesStrArray) {
    if (hintPipeStr.trim() != "") {
      hintPipesJSONArray.push(hintPipeStr2JSON(hintPipeStr.trim()));
    } else {;
    }
  }
  return hintPipesJSONArray;
}

function hintPipeJSON2DotEdgeStr(hintPipeJSON) {
  var dotEdgeStr = "";
  if (isEmpty(hintPipeJSON) === false) {
    dotEdgeStr = hintPipeJSON["inPort"] + " -> " + hintPipeJSON["outPort"] + "\n";
  } else {;
  }
  return dotEdgeStr;
}

function hintPipesJSONArray2DotEdgesStr(hintPipesJSONArray) {
  var dotEdgesStr = "";
  for (hintPipeJSON of hintPipesJSONArray) {
    dotEdgesStr += "  " + hintPipeJSON2DotEdgeStr(hintPipeJSON);
  }
  return dotEdgesStr;
}

function hintPipesStr2DotEdgesStr(hintPipesStr) {
  var hintPipesJSONArray = hintPipesStr2JSONArray(hintPipesStr);
  return hintPipesJSONArray2DotEdgesStr(hintPipesJSONArray);
}
