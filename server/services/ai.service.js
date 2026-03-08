const { GoogleGenerativeAI } = require('@google/generative-ai');

// Function to generate feedback using Gemini
async function generateRepoFeedback(repoDetails, languages, tree) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // use gemini-2.5-flash for fast responses
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Filter out noisy data from the tree to save tokens
  const simplifiedTree = (tree || [])
    .filter(t => !t.path.startsWith('node_modules/') && !t.path.startsWith('.git/'))
    .map(t => t.path)
    .slice(0, 100); // limit to top 100 paths

  const prompt = `
You are an expert Senior Software Engineer and Open Source Maintainer.
Please review the following GitHub repository and provide 3-4 highly constructive, actionable points of feedback on how the developer can improve the repository. Focus on best practices (e.g., structure, CI/CD, documentation, testing, unused files).

Repository Details:
- Name: ${repoDetails.name}
- Description: ${repoDetails.description || 'No description provided'}
- Primary Language: ${repoDetails.language}
- Languages used (Bytes): ${JSON.stringify(languages)}
- Topics: ${JSON.stringify(repoDetails.topics || [])}

File Structure (Max 100 files):
${JSON.stringify(simplifiedTree, null, 2)}

Provide your response strictly in Markdown format. Keep it concise, actionable, and encouraging. Do not provide a long introduction or conclusion. Format as a bulleted list.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

module.exports = { generateRepoFeedback };
