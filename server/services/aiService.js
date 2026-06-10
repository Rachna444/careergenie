const { GoogleGenerativeAI } = require('@google/generative-ai');

const analyzeResumeWithAI = async (resumeText) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) and career coach.
      Please analyze the following resume text and provide a JSON response (strictly without markdown block backticks) containing the following fields:
      - resumeScore: a number between 0 and 100 representing overall quality.
      - atsScore: a number between 0 and 100 representing ATS compatibility.
      - strengths: an array of strings detailing the strong points.
      - weaknesses: an array of strings detailing areas for improvement.
      - missingSkills: an array of strings listing skills that should ideally be added.
      - aiFeedback: an array of strings with actionable feedback.
      - projectSuggestions: an array of strings suggesting potential projects to improve the resume.
      - careerRecommendations: an array of strings with suggested job roles or career paths.

      Resume Text:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting in response
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse Gemini response', text);
      throw new Error('AI returned invalid format');
    }

  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze resume with AI: ' + error.message);
  }
};

module.exports = { analyzeResumeWithAI };
