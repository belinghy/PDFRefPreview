# PDF Ref Preview

A bookmarklet is a link that contains Javascript. To install a bookmarklet, the most common way is to drag and drop a bookmarklet link into your browser's bookmark bar.

This bookmarklet only works if the viewer uses [pdf.js](https://github.com/mozilla/pdf.js/), which is the default in Firefox.

Drag this link into the bookmark bar.

<a href="javascript:(async()=>{const e=window.PDFViewerApplication;if('_mouseoverHandler'in e)return document.removeEventListener('mouseover',e._mouseoverHandler),void delete e._mouseoverHandler;let t=await e.pdfDocument.getData(),n=pdfjsLib.getDocument({data:t});const o=await n.promise,i=await o.getDestinations();async function a(t){if('internalLink'!=t.target.className)return;const n=t.target.hash,a=t.target.parentElement,r=document.createElement('canvas');r.style.border='1px solid black',r.style.direction='ltr';const s=n.substring(1),d=s in i?i[s]:JSON.parse(decodeURIComponent(s)),c=e.pdfLinkService._cachedPageNumber(d[0]);o.getPage(c).then(function(e){const t=e.getViewport({scale:1});r.style.height=`${t.height}px`,r.style.width=`${t.width}px`;const n=e.getViewport({scale:4,offsetX:4*-d[2],offsetY:4*(d[3]-t.height)});r.height=n.height,r.width=n.width;const o={canvasContext:r.getContext('2d'),viewport:n};e.render(o)}),a.appendChild(r),a.addEventListener('mouseleave',function(e){r.remove()})}document.addEventListener('mouseover',a),e._mouseoverHandler=a})();">PDFRefPreview</a>
