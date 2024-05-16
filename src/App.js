import { useRef } from 'react';
import {
  PDFDocument,
  PDFCheckBox,
  PDFOptionList,
  PDFTextField,
  PDFDropdown,
  createPDFAcroFields,
  PDFName,
} from 'pdf-lib';
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

    const replaceCheckboxValue = (value) =>
      value.replace(/^\/((Off)|(No))$/i, '/No').replace(/^\/((On)|(Yes))$/i, '/Yes');

    for (const key of keys) {
      try {
        const value = values[key];
        if (!value) {
          continue;
        }
        const field = form.getField(key);
        if (field instanceof PDFCheckBox) {
          const kids = createPDFAcroFields(field.acroField.Kids()).map((_) => _[0]);
          const selectedValue = replaceCheckboxValue(PDFName.of(value.join('')).toString());
          kids.forEach((kid) => {
            const selectedKidValue = replaceCheckboxValue(kid.getOnValue().toString());
            if (selectedValue === selectedKidValue) {
              kid.setValue(kid.getOnValue()); // Check that particular checkbox.
            }
          });
        } else if (field instanceof PDFOptionList) {
          form.getOptionList(key).select(value);
        } else if (field instanceof PDFTextField) {
          form.getTextField(key).setText(value);
        } else if (field instanceof PDFDropdown) {
          form.getDropdown(key).select(value);
        } else {
          console.log(field);
        }
      } catch (e) {
        console.error(e);
      }
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
