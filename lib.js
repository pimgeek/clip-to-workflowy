// hintsnet 引思网专用库函数

// 定义 CJK 字符相关正则表达式
var regExpEn = "[a-zA-Z0-9]";
var regExpCJKIdeographs = "[㐀-\u4dbe一-\u9ffe]|[\ud840-\ud868\ud86a-\ud86c][\udc00-\udfff]|\ud869[\udc00-\udede\udf00-\udfff]|\ud86d[\udc00-\udf3e\udf40-\udfff]|\ud86e[\udc00-\udc1e]|[\ufa0e\ufa0f\ufa11\ufa13\ufa14\ufa1f\ufa21\ufa23\ufa24\ufa27-\ufa29]";
var regExpCJKSymbols = "[\u3000-〾（）]";

function hintPipeIsEqual(hintPipeA, hintPipeB) {
  if (hintPipeA["inPort"] === hintPipeB["inPort"] &&
    hintPipeA["outPort"] === hintPipeB["outPort"]) {
    return true;
  } else {
    return false;
  }
}

// 把引思管道从字符串描述转换为 JS 对象
function hintPipeStr2Obj(hintPipeStr) {
  var portLabelPattern = regExpEn + "|" + regExpCJKIdeographs + "|" + regExpCJKSymbols;
  var hintPipePattern =
    "((" + portLabelPattern + ")+)" +
    "\\|->\\|" +
    "((" + portLabelPattern + ")+)";
  var hintPipeObj = {};
  var regExpForhintPipe = new RegExp(hintPipePattern, "g");
  var regExpMatchResult = regExpForhintPipe.exec(hintPipeStr);

  if (regExpMatchResult != null) {
    hintPipeObj = {
      "inPort": regExpMatchResult[1],
      "outPort": regExpMatchResult[3]
    };
  } else {;
  }
  return hintPipeObj;
}

// 把引思管道大段文本的每个元素都从字符串描述转换为 JS 对象
function hintPipeText2ObjArray(hintPipeText) {
  hintPipeStrArray = hintPipeText.split('\n');
  var hintPipeObjArray = [];
  for (hintPipeStr of hintPipeStrArray) {
    if (hintPipeStr.trim() != "") {
      hintPipeObjArray.push(hintPipeStr2Obj(hintPipeStr.trim()));
    } else {;
    }
  }
  return hintPipeObjArray;
}

// 把引思管道从 JS 对象转换为 Dot 语法描述
function hintPipeObj2DotEdge(hintPipeObj) {
  var DotEdge = "";
  if (isEmpty(hintPipeObj) === false) {
    DotEdge = '  "' + hintPipeObj["inPort"] + '" -> "' + hintPipeObj["outPort"] + '"\n';
  } else {;
  }
  return DotEdge;
}

// 把引思管道序列的每个元素都从 JS 对象转换为 Dot 语法描述字符串
function hintPipeObjArray2DotEdges(hintPipeObjArray) {
  var DotEdges = "";
  for (hintPipeObj of hintPipeObjArray) {
    DotEdges += hintPipeObj2DotEdge(hintPipeObj);
  }
  return DotEdges;
}

// 把引思管道序列转换为 Dot 语法描述字符串
function hintPipeText2DotEdges(hintPipeText) {
  var hintPipeObjArray = hintPipeText2ObjArray(hintPipeText);
  return hintPipeObjArray2DotEdges(hintPipeObjArray);
}

// 为 Dot 语法描述字符串加上 digraph 的外包裹
function dotEdges2Digraph(dotEdges, graphDir) {
  return 'digraph {\n' +
    '  rankdir=' + graphDir + '\n' +
    '  graph [fontname="simhei" splines="polyline"]\n' +
    '  edge  [fontname="simhei"]\n' +
    '  node  [fontname="simhei" shape="box"]\n' +
    dotEdges +
    "}\n"
}

// 把引思管道序列转换为横向 digraph
function dotEdges2DigraphLR(hintPipeText) {
  var dotEdges = hintPipeText2DotEdges(hintPipeText);
  var digraphLR = dotEdges2Digraph(dotEdges, 'LR');
  return digraphLR;
}

// 把引思管道序列转换为纵向 digraph
function dotEdges2DigraphTB(hintPipeText) {
  var dotEdges = hintPipeText2DotEdges(hintPipeText);
  var digraphTB = dotEdges2Digraph(dotEdges, 'TB');
  return digraphTB;
}
