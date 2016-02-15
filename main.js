// 测试 hintsnet 引思网库函数是否工作正常

var hintPipe1 = {
  "inPort": "a",
  "outPort": "b"
};
var hintPipe2 = {
  "inPort": "a",
  "outPort": "c"
};
var hintPipe3 = {
  "inPort": "a",
  "outPort": "b"
};

var hintPipesStr = "ab中国人|->|cd困了、累了、喝红牛 #ads #biz-pitch\n" +
  "偏序图渲染服务|->|以图答问微信号 #partial-order #hintsnet-meta #biz-pitch \n" +
  "引思网已部署完毕|->|讨论共识可作为项目完成度的单元测试工具 #partial-order #hintsnet-meta #biz-pitch \n";

var hintPipesJSONArray = hintPipesStr2JSONArray(hintPipesStr);
console.log(hintPipesJSONArray);

var dotEdgesStr = hintPipesJSONArray2DotEdgesStr(hintPipesJSONArray);
console.log(dotEdgesStr);

//console.log(hintPipeIsEqual(hintPipe1, hintPipe2));
//console.log(hintPipeIsEqual(hintPipe1, hintPipe3));
//console.log(hintPipeIsEqual(hintPipe2, hintPipe3));
