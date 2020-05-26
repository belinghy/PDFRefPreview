(async () => {
  const app = window.PDFViewerApplication;
  if ('_previewHandler' in app) {
    document.removeEventListener('mouseover', app._previewHandler);
    delete app._previewHandler;
    return;
  }

  const destinations = await app.pdfDocument.getDestinations();

  async function mouseoverHandler(event) {
    if (event.target.className != 'internalLink') return;

    const hash = event.target.hash;
    const parent = event.target.parentElement;

    const preview = document.createElement('canvas');
    preview.style.border = '1px solid black';
    preview.style.direction = 'ltr';

    const namedDest = hash.substring(1);
    const explicitDest =
      namedDest in destinations
        ? destinations[namedDest]
        : JSON.parse(decodeURIComponent(namedDest));
    const pageNumber = app.pdfLinkService._cachedPageNumber(explicitDest[0]);

    app.pdfDocument.getPage(pageNumber).then(function (page) {
      const tempViewport = page.getViewport({ scale: 1.0 });
      preview.style.height = `${tempViewport.height}px`;
      preview.style.width = `${tempViewport.width}px`;

      const scale = 4.0;
      const viewport = page.getViewport({
        scale: scale,
        offsetX: -explicitDest[2] * scale,
        offsetY: (explicitDest[3] - tempViewport.height) * scale,
      });

      preview.height = viewport.height;
      preview.width = viewport.width;

      const renderContext = {
        canvasContext: preview.getContext('2d'),
        viewport: viewport,
      };
      page.render(renderContext);
    });

    parent.appendChild(preview);

    parent.addEventListener('mouseleave', function (event) {
      preview.remove();
    });
  }
  document.addEventListener('mouseover', mouseoverHandler);
  app._previewHandler = mouseoverHandler;
})();
