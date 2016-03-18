javascript: (function() {
  var inbox = 'https://workflowy.com/#';

  function eopml(i) {
    var o = i.replace(/&/g, '&amp;amp;').replace(/</g, '&amp;lt;').replace(/>/g, '&amp;gt;').replace(/"/g, '&quot;').replace(/(\n)/g, '&#10;');
    return (o);
  }

  var bullet = eopml(document.title);
  var link = eopml(location.href) + ' ';
  var selected = eopml(window.getSelection().toString());
  var isWorkFlowy = location.href.indexOf('workflowy.com/#');
  var isChrome = !!window.chrome;

  if (selected) { link = '&#10;' + link + '&#10;&#10;'; }
  if (isWorkFlowy !== -1) {
    var bullet = '&lt;i&gt;See: &quot;' +
      bullet.replace(/ - WorkFlowy$/, '') +
      '&quot;&lt;/i&gt;';
  }

  var clip = '<opml><body><outline text="' +
    bullet +
    '" _note="' +
    selected +
    link +
    '" /></body></opml>';

  if (isChrome && clip.length > 2000) {
    window.open('' +
      inbox +
      '/?q=' +
      encodeURIComponent(clip) +
      '');
  } else {
    var userInput = prompt('1\) COPY the text below. (Ctrl C\) or \(Cmd C\)\n\n2\) OK = Launch WorkFlowy Home.\n    CANCEL = Go to WorkFlowy manually.\n\n3\) PASTE into a new WorkFlowy bullet.   \(v2.4\)\n', clip);
    if (userInput !== null) {
      if (isWorkFlowy !== -1) { location.href = inbox; } else { ; }
    } else {
      return;
    }
  }
})()
