javascript: (function() {
  var inbox = 'https://workflowy.com/#';

  function eopml(i) {
    var o = i.replace(/&/g, '&amp;amp;').replace(/</g, '&amp;lt;').replace(/>/g, '&amp;gt;').replace(/"/g, '&quot;').replace(/(\n)/g, '&#10;');
    return (o);
  }

  var docTitle = eopml(document.title);
  var docUrl = eopml(location.href) + ' ';
  var docSelection = eopml(window.getSelection().toString());
  var isWorkFlowy = location.href.indexOf('workflowy.com/#');
  var isChrome = !!window.chrome;

  if (isWorkFlowy !== -1) {
    var docTitle = '&lt;i&gt;See: &quot;' +
      docTitle.replace(/ - WorkFlowy$/, '') +
      '&quot;&lt;/i&gt;';
  }

  var clip = '<?xml version="1.0"?>' +
    '<opml version="2.0">' +
    '  <head>' +
    '    <ownerEmail>wudibiz@163.com</ownerEmail>' +
    '  </head>' +
    '  <body>' + 
    '    <outline text="|-&amp;gt;| #hint-pipe #to-refine " >' +
    '      <outline text="关键问题" >' +
    '        <outline text="' + docSelection + '" /></outline>' +
    '      <outline text="问题来源" >' +
    '        <outline text="描述一下问题的来龙去脉" /></outline>' +
    '      <outline text="相关资源" >' +
    '        <outline text="' + docTitle + '" _note="' + docUrl +'" /></outline>' +
    '  </body>' +
    '</opml>';

  if (isChrome && clip.length > 2000) {
    window.open('' +
      inbox +
      '/?q=' +
      encodeURIComponent(clip) +
      '');
  } else {
    var userInput = prompt('1\) COPY the text below. (Ctrl C\) or \(Cmd C\)\n\n2\) OK = Launch WorkFlowy Home.\n    CANCEL = Go to WorkFlowy manually.\n\n3\) PASTE into a new WorkFlowy docTitle.   \(v2.4\)\n', clip);
    if (userInput !== null) {
      if (isWorkFlowy !== -1) { location.href = inbox; } else { ; }
    } else {
      return;
    }
  }
})()
