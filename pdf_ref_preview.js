(async () => {
  const app = window.PDFViewerApplication;
  if ("_previewHandler" in app) {
    document.removeEventListener("mouseover", app._previewHandler);
    delete app._previewHandler;
    delete app._previewing;
    return;
  }

  const destinations = await app.pdfDocument.getDestinations();
  const anchor = document.getElementById("viewer");
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
    previewStyle.zIndex = "2";
    previewStyle.top = `${event.clientY + 4}px`;

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
      previewStyle.height = `${height}px`;
      previewStyle.width = `${width}px`;
      previewStyle.left = `${event.clientX - width / 3 - 4}px`;

      let viewport;
      const scale = 4;
      switch (explicitDest[1].name) {
        case "XYZ":
          viewport = page.getViewport({
            scale: scale,
            offsetX: -explicitDest[2] * scale,
            offsetY: (explicitDest[3] - tempViewport.height) * scale,
          });
          break;
        case "FitH":
        case "FitBH":
        case "FitV":
        case "FitBV":
          viewport = page.getViewport({
            scale: scale,
            offsetY: (explicitDest[2] - tempViewport.height) * scale,
          });
          break;
        default:
          console.log(`Oops, link ${explicitDest[1].name} is not supported.`);
      }

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
  document.addEventListener("mouseover", mouseoverHandler);
  app._previewHandler = mouseoverHandler;
})();
