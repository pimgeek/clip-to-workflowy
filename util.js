// 判断 JS 对象是否为空
// 来自 http://stackoverflow.com/questions/4994201/is-object-empty
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

// 求两个 JS 对象序列的交集，并且返回作为交集的对象序列
function objArrayUnion(objArray1, objArray2) {
  var strArray1 = objArray1.map(JSON.stringify);
  var strArray2 = objArray2.map(JSON.stringify);
  var strSetUnion = new Set([...strArray1].concat([...strArray2]));
  var objArrayUnion = Array.from(strSetUnion).map(JSON.parse);
  return objArrayUnion;
}