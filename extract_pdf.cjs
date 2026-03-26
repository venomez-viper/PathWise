const fs = require('fs');
const pdf = require('pdf-parse');

const filePath = '../Zafuture Presentation Template.pdf.opdownload';

if (fs.existsSync(filePath)) {
  const dataBuffer = fs.readFileSync(filePath);
  const parseFn = typeof pdf === 'function' ? pdf : (pdf.default || pdf.pdfParse || Object.values(pdf)[0]);
  
  if (typeof parseFn !== 'function') {
    console.error("Could not find parse function in pdf-parse module. Keys:", Object.keys(pdf));
    process.exit(1);
  }

  parseFn(dataBuffer).then(function(data) {
    console.log(data.text);
  }).catch(function(error) {
    console.error("Error reading PDF:", error.message);
  });
} else {
  console.error("File not found at", filePath);
}
