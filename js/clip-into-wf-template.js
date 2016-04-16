javascript: (function() {
  var inbox = 'https://workflowy.com/#';

  function eopml(i) {
    var o = i.replace(/&/g, '&amp;amp;').replace(/</g, '&amp;lt;').replace(/>/g, '&amp;gt;').replace(/"/g, '&quot;').replace(/(\n)/g, '&#10;');
    return (o);
  }

  var docTitle = eopml(document.title);
  var docUrl = eopml(location.href) + ' ';
  var docSelection = eopml(window.getSelection().toString());
  var docSelectionSplitIdx = docSelection.search(/[.;:?!。；：？！\r\n]/);
  var docSelectionHeader = docSelection.substring(0, docSelectionSplitIdx + 1);
  var isWorkFlowy = location.href.indexOf('workflowy.com/#');
  var isChrome = !!window.chrome;

  if (isWorkFlowy !== -1) {
    var docTitle = '&lt;i&gt;参见&quot;' +
      docTitle.replace(/ - WorkFlowy$/, '') +
      '&quot;&lt;/i&gt;';
  }

  var clip = '<?xml version="1.0"?>' +
    '<opml version="2.0">' +
    '  <head>' +
    '    <ownerEmail>username@workflowy.com</ownerEmail>' +
    '  </head>' +
    '  <body>' + 
    '    <outline text="' + docSelectionHeader + '" >' +
    '      <outline text="关注的重点" _note="' + docSelection + '" />' +
    '      <outline text="关注的理由" _note="我为何会收藏这个网址？" />' +
    '      <outline text="传送门" >' +
    '        <outline text="' + docTitle + '" _note="' + docUrl +'" /></outline>' +
    '    </outline>' +
    '  </body>' +
    '</opml>';

  if (isChrome && clip.length > 2000) {
    window.open('' +
      inbox +
      '/?q=' +
      encodeURIComponent(clip) +
      '');
  } else {
    var userInput = prompt('  请复制下列文字 \(Ctrl + C\) 或 \(Cmd + C\) \n\n  并打开 Workflowy 页签粘贴为新的笔记条目\n', clip);
    if (userInput !== null) {
      if (isWorkFlowy !== -1) { location.href = inbox; } else { ; }
    } else {
      return;
    }
  }
})()
