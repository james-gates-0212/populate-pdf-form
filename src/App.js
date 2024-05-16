import { useRef } from 'react';
import { PDFDocument, PDFCheckBox, PDFOptionList, PDFTextField, PDFDropdown } from 'pdf-lib';
import './App.css';
import PdfViewerComponent from './components/PdfViewerComponent';

function App() {
  const pdfViewerInstance = useRef();

  const sampleDocumentName = 'document-decrypted.pdf';

  const fillForm = async (values) => {
    // Step 1: Load the PDF form.
    const formUrl = sampleDocumentName;
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(formPdfBytes, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });

    if (pdfDoc.isEncrypted) {
      alert('Document is encrypted');
      return;
    }

    // Step 2: Retrieve the form fields.
    const form = pdfDoc.getForm();

    // Step 3: Set values for the form fields.

    const keys = Object.keys(values);

    for (const key of keys) {
      try {
        const value = values[key];
        if (!value) {
          continue;
        }
        const field = form.getField(key);
        if (field instanceof PDFCheckBox) {
          if (key === '205_08') {
            console.log(key, value);
          }
          if (/^(yes)$/i.test(value.join(''))) {
            form.getCheckBox(key).check();
          } else {
            form.getCheckBox(key).uncheck();
          }
        } else if (field instanceof PDFOptionList) {
          form.getOptionList(key).select(value);
        } else if (field instanceof PDFTextField) {
          form.getTextField(key).setText(value);
        } else if (field instanceof PDFDropdown) {
          console.log(key, value);
          form.getDropdown(key).select(value);
        } else {
          console.log(field);
        }
      } catch (e) {}
    }

    // Step 4: Save the modified PDF.
    const pdfBytes = await pdfDoc.save();

    // Step 5: Create a `Blob` from the PDF bytes,
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Step 6: Create a download URL for the `Blob`.
    const url = URL.createObjectURL(blob);

    // Step 7: Create a link element and simulate a click event to trigger the download.
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filled_form.pdf';
    link.click();
  };

  const onGetFieldValues = async () => {
    if (pdfViewerInstance.current) {
      fillForm(pdfViewerInstance.current.getFormFieldValues());
    }
  };
  return (
    <div className="App">
      <div className="Toolbar">
        <button onClick={onGetFieldValues}>Get Field Values</button>
      </div>
      <div className="PDF-viewer">
        <PdfViewerComponent ref={pdfViewerInstance} document={sampleDocumentName} />
      </div>
    </div>
  );
}

export default App;
