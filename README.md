# PDF Ref Preview

Preview internal links in PDFs on mouse hover.

<p align="center">
  <img title="Demo" src="https://raw.githubusercontent.com/belinghy/PDFRefPreview/assets/assets/demo.gif">
</p>

The script works by following internal links to the target page and location, and render the view in a separate canvas. Some PDFs may not work because the internal links are broken.

This script only works if the viewer is [PDF.js](https://github.com/mozilla/pdf.js/).

## Firefox

PDF.js is the default viewer in Firefox. To install the script, create a bookmark and add the code below to the `location` field. Use the bookmark to toggle enable/disable preview after a PDF has been loaded.

```js
javascript:(async()=>{const e=window.PDFViewerApplication,t=document.getElementById("viewer");if("_previewHandler"in e)return t.removeEventListener("mouseover",e._previewHandler),delete e._previewHandler,void delete e._previewing;const n=t.getBoundingClientRect(),i=(n.left+n.right)/2,r=await e.pdfDocument.getDestinations();async function o(n){if("internalLink"!=n.target.className||e._previewing)return;const o=n.target.hash,a=n.target.parentElement,c=document.createElement("canvas"),s=c.style;s.border="1px solid black",s.direction="ltr",s.position="fixed",s.zIndex="99",s.top=`${n.clientY+4}px`,s.boxShadow="5px 5px 5px black, -5px 5px 5px black";const p=decodeURIComponent(o.substring(1)),d=p in r?r[p]:JSON.parse(p),l=e.pdfLinkService._cachedPageNumber(d[0]);e.pdfDocument.getPage(l).then(function(t){const r=t.getViewport({scale:1}),o=1.2*r.height*e.pdfViewer.currentScale,a=1.2*r.width*e.pdfViewer.currentScale,p=n.clientX>i?2*a/3:a/3;let l;switch(s.height=`${o}px`,s.width=`${a}px`,s.left=`${n.clientX-p-4}px`,d[1].name){case"XYZ":l=d[3];break;case"FitH":case"FitBH":case"FitV":case"FitBV":l=d[2];break;default:console.log(`Oops, link ${d[1].name} is not supported.`)}const g=t.getViewport({scale:4,offsetY:4*(l-r.height)});c.height=g.height,c.width=g.width;const w={canvasContext:c.getContext("2d"),viewport:g};t.render(w)}),t.prepend(c),e._previewing=!0,a.addEventListener("mouseleave",function(t){c.remove(),e._previewing=!1})}e._previewing=!1,t.addEventListener("mouseover",o),e._previewHandler=o})();
```

The complete unminified bookmarklet is below. See [issue #2](https://github.com/belinghy/PDFRefPreview/issues/2) for ideas on customizing the script to individual preferences.

```js
javascript:(async function togglePreview() {
  const app = window.PDFViewerApplication;
  const anchor = document.getElementById("viewer");
  if ("_previewHandler" in app) {
    anchor.removeEventListener("mouseover", app._previewHandler);
    delete app._previewHandler;
    delete app._previewing;
    return;
  }

  const box = anchor.getBoundingClientRect();
  const halfWidth = (box.left + box.right) / 2;
  const destinations = await app.pdfDocument.getDestinations();
  app._previewing = false;

  async function mouseoverHandler(event) {
    if (event.target.className != "internalLink" || app._previewing) return;

    const hash = event.target.hash;
    const parent = event.target.parentElement;

    const preview = document.createElement("canvas");
    const previewStyle = preview.style;
    previewStyle.border = "1px solid black";
    previewStyle.direction = "ltr";
    previewStyle.position = "fixed";
    previewStyle.zIndex = "99";
    previewStyle.top = `${event.clientY + 4}px`;
    previewStyle.boxShadow = "5px 5px 5px black, -5px 5px 5px black";

    const namedDest = decodeURIComponent(hash.substring(1));
    const explicitDest =
      namedDest in destinations
        ? destinations[namedDest]
        : JSON.parse(namedDest);
    const pageNumber = app.pdfLinkService._cachedPageNumber(explicitDest[0]);

    app.pdfDocument.getPage(pageNumber).then(function (page) {
      const tempViewport = page.getViewport({ scale: 1.0 });
      const height = tempViewport.height * 1.2 * app.pdfViewer.currentScale;
      const width = tempViewport.width * 1.2 * app.pdfViewer.currentScale;
      const leftOffset =
        event.clientX > halfWidth ? (2 * width) / 3 : width / 3;
      previewStyle.height = `${height}px`;
      previewStyle.width = `${width}px`;
      previewStyle.left = `${event.clientX - leftOffset - 4}px`;

      let offsetY;
      switch (explicitDest[1].name) {
        case "XYZ":
          offsetY = explicitDest[3];
          break;
        case "FitH":
        case "FitBH":
        case "FitV":
        case "FitBV":
          offsetY = explicitDest[2];
          break;
        default:
          console.log(`Oops, link ${explicitDest[1].name} is not supported.`);
      }

      const scale = 4;
      const viewport = page.getViewport({
        scale: scale,
        offsetY: (offsetY - tempViewport.height) * scale,
      });

      preview.height = viewport.height;
      preview.width = viewport.width;

      const renderContext = {
        canvasContext: preview.getContext("2d"),
        viewport: viewport,
      };
      page.render(renderContext);
    });

    anchor.prepend(preview);
    app._previewing = true;

    parent.addEventListener("mouseleave", function (event) {
      preview.remove();
      app._previewing = false;
    });
  }
  anchor.addEventListener("mouseover", mouseoverHandler);
  app._previewHandler = mouseoverHandler;
})();
```

## Chrome

To use in Chrome, follow the steps below to install the extension to replace the PDF viewer. Afterwards, use `q` to toggle preview modes (off by default).

Download and extract `dist/chromium.tar.gz` → open Chrome → More Tools → Extensions → Load unpacked (enable developer mode) → choose the extracted folder.

To build your own extension, follow the instructions in `src/pdf.js`. The link contains a fork of `pdf.js`, the relevant files are `web/pdf_ref_preview.js` and `web/app.js`.