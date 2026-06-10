const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const extractTextFromResume = async (fileUrl) => {
  try {
    // Download file buffer
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const lowerUrl = fileUrl.toLowerCase();
    
    // Cloudinary URLs might not always have the extension if we uploaded raw, 
    // but assuming standard usage or checking contents:
    try {
      // First try PDF
      const data = await pdfParse(buffer);
      if (data && data.text && data.text.trim().length > 0) {
        return data.text;
      }
    } catch (pdfError) {
      // If PDF fails, try DOCX
      try {
        const data = await mammoth.extractRawText({ buffer });
        return data.value;
      } catch (docxError) {
        throw new Error('Unsupported file format or unable to parse text');
      }
    }
    
    // Fallback if pdfParse didn't throw but returned empty
    const docxData = await mammoth.extractRawText({ buffer }).catch(() => ({ value: '' }));
    return docxData.value || 'No text extracted';

  } catch (error) {
    throw new Error('Failed to extract text from resume: ' + error.message);
  }
};

module.exports = { extractTextFromResume };
