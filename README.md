# PDF Ref Preview

Preview internal links in PDFs on mouse hover.

<p align="center">
  <img title="Demo" src="https://raw.githubusercontent.com/belinghy/PDFRefPreview/assets/assets/demo.gif">
</p>

A bookmarklet is a link that contains Javascript, execute it after a PDF has been loaded. To install the bookmarklet, create a bookmark and add the code below to the location field.

```js
javascript:(async()=>{const e=window.PDFViewerApplication;if('_previewHandler'in e)return document.removeEventListener('mouseover',e._previewHandler),void delete e._previewHandler;const t=await e.pdfDocument.getDestinations();async function n(n){if('internalLink'!=n.target.className)return;const i=n.target.hash,o=n.target.parentElement,r=document.createElement('canvas');r.style.border='1px solid black',r.style.direction='ltr';const a=decodeURIComponent(i.substring(1)),s=a in t?t[a]:JSON.parse(a),d=e.pdfLinkService._cachedPageNumber(s[0]);e.pdfDocument.getPage(d).then(function(e){const t=e.getViewport({scale:1});r.style.height=`${t.height}px`,r.style.width=`${t.width}px`;const n=e.getViewport({scale:4,offsetX:4*-s[2],offsetY:4*(s[3]-t.height)});r.height=n.height,r.width=n.width;const i={canvasContext:r.getContext('2d'),viewport:n};e.render(i)}),o.appendChild(r),o.addEventListener('mouseleave',function(e){r.remove()})}document.addEventListener('mouseover',n),e._previewHandler=n})();
```

The script works by following internal links to the target page and location, and render the view in a separate canvas.

This script only works if the viewer is [PDF.js](https://github.com/mozilla/pdf.js/), which is the default in Firefox. In Chrome, it is possible to switch the PDF viewer using extensions, but this tool is not tested there.