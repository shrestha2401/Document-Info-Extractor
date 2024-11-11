const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 
const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const parseDocumentDetails = (text) => {
    const namePattern = /Name\s*:\s*([A-Za-z\s]+)/;
    const documentNumberPattern = /Document\s*Number\s*:\s*(\w+)/;
    const expirationDatePattern = /Expiration\s*Date\s*:\s*(\d{2}\/\d{2}\/\d{4})/;

    const nameMatch = text.match(namePattern);
    const documentNumberMatch = text.match(documentNumberPattern);
    const expirationDateMatch = text.match(expirationDatePattern);

    return {
        name: nameMatch ? nameMatch[1].trim() : null,
        document_number: documentNumberMatch ? documentNumberMatch[1].trim() : null,
        expiration_date: expirationDateMatch ? expirationDateMatch[1].trim() : null,
    };
};

app.use(express.json());

app.post('/api/extract-info', upload.single('document'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imagePath = req.file.path;

    Tesseract.recognize(imagePath, 'eng')
        .then(({ data: { text } }) => {
            const documentDetails = parseDocumentDetails(text);
            fs.unlinkSync(imagePath); // Clean up uploaded file

            if (!documentDetails.name || !documentDetails.document_number || !documentDetails.expiration_date) {
                return res.status(400).json({ error: 'Failed to extract all required fields', details: documentDetails });
            }

            res.json(documentDetails);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error processing image', details: err.message });
        });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
