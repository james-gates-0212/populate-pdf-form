import PSPDFKit from 'pspdfkit';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const permittedToolbarTypes = [
  // 'sidebar-thumbnails',
  'pager',
  // 'pan',
  'zoom-out',
  'zoom-in',
  // 'zoom-mode',
  'spacer',
  // 'print',
  'search',
  // 'export-pdf',
];

const isDevMode = process.env.NODE_ENV === 'development';

let instance = null;

const PdfViewerComponent = forwardRef((props, ref) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    (async function () {
      PSPDFKit.unload(container);

      instance = await PSPDFKit.load({
        container: isDevMode ? container : '#pdf-viewer',
        document: props.document,
        baseUrl: isDevMode
          ? `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`
          : undefined,
        appName: 'populate-pdf-form',
      });

      const toolbarItems = instance.toolbarItems;

      instance.setToolbarItems(toolbarItems.filter((item) => permittedToolbarTypes.includes(item.type)));
    })();

    return () => PSPDFKit && PSPDFKit.unload(container);
  }, [props.document]);

  useImperativeHandle(ref, () => ({
    getFormFieldValues: () => {
      if (!instance) {
        return null;
      }
      return instance.getFormFieldValues();
    },
    getFormFields: async () => {
      if (!instance) {
        return null;
      }
      return await instance.getFormFields();
    },
  }));

  return <div id="pdf-viewer" ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});

export default PdfViewerComponent;
