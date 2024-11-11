import React, { useState } from 'react';
import axios from 'axios';

const ExtractForm = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await axios.post('http://localhost:5000/api/extract-info', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error processing file');
            setResult(null);
        }
    };

    return (
        <div>
            <h2>Upload Document for Extraction</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <button type="submit">Extract Info</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {result && (
                <div>
                    <h3>Extracted Information</h3>
                    <p><strong>Name:</strong> {result.name}</p>
                    <p><strong>Document Number:</strong> {result.document_number}</p>
                    <p><strong>Expiration Date:</strong> {result.expiration_date}</p>
                </div>
            )}
        </div>
    );
};

export default ExtractForm;
