# PDF Ref Preview

Preview internal links in PDFs on mouse hover.

<p align="center">
  <img title="Demo" src="https://raw.githubusercontent.com/belinghy/PDFRefPreview/assets/assets/demo.gif">
</p>

The script works by following internal links to the target page and location, and render the view in a separate canvas. Some PDFs may not work because the internal links are broken.

This script only works if the viewer is [PDF.js](https://github.com/mozilla/pdf.js/).

## Firefox

PDF.js is the default viewer in Firefox. To install the script, create a bookmark and add the code below to the `location` field.
See [issue #2](https://github.com/belinghy/PDFRefPreview/issues/2) for ideas on customizing the script to individual preferences.

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
    if (!event.target.offsetParent.hasAttribute("data-internal-link") || app._previewing) return;

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

To use in Chrome, follow the build and install instructions `src/pdf.js` README file for Chrome, e.g.,

```sh
git clone git@github.com:belinghy/PDFRefPreview.git --recu
cd PDFRefPreview/src/pdf.js

npm install -g gulp-cli
npm install
gulp chromium
```

Then open Chrome, go to `Tools > Extension` and load the (unpackaged) extension from the directory `build/chromium`.

The preview function can be customized by tweaking `src/pdf.js/web/pdf_ref_preview.js`.
The `togglePreview` function is called in `src/pdf.js/web/app.js`.

By default, the preview function is enabled on every PDF and can be toggled by pressing `q`.