import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function identifyPlant(imageData: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    // Convert base64 to blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    // Create image part
    const imagePart = {
      inlineData: {
        data: imageData.split(',')[1],
        mimeType: 'image/jpeg',
      },
    };

    const prompt = `Analyze this plant image and provide the following information in JSON format:
    {
      "species": "scientific name",
      "commonNames": ["common name 1", "common name 2"],
      "confidence": 0.95,
      "careInstructions": [
        "watering frequency",
        "sunlight requirements",
        "soil type",
        "temperature range"
      ],
      "health": "healthy|warning|critical",
      "issues": ["issue1", "issue2"],
      "recommendations": ["recommendation1", "recommendation2"]
    }`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const analysis = JSON.parse(text);
    return analysis;
  } catch (error) {
    console.error('Error identifying plant:', error);
    throw error;
  }
}

export async function analyzePlantHealth(imageData: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    const imagePart = {
      inlineData: {
        data: imageData.split(',')[1],
        mimeType: 'image/jpeg',
      },
    };

    const prompt = `Analyze this plant's health and provide the following information in JSON format:
    {
      "health": "healthy|warning|critical",
      "confidence": 0.95,
      "issues": ["issue1", "issue2"],
      "recommendations": ["recommendation1", "recommendation2"]
    }`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const analysis = JSON.parse(text);
    return analysis;
  } catch (error) {
    console.error('Error analyzing plant health:', error);
    throw error;
  }
}

export async function getPlantCareAdvice(plantSpecies: string, weatherData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Given the following plant species and weather conditions, provide care advice in JSON format:
    Plant: ${plantSpecies}
    Weather: ${JSON.stringify(weatherData)}
    
    Provide response in this format:
    {
      "watering": "advice",
      "sunlight": "advice",
      "temperature": "advice",
      "humidity": "advice",
      "fertilizing": "advice",
      "warnings": ["warning1", "warning2"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const advice = JSON.parse(text);
    return advice;
  } catch (error) {
    console.error('Error getting plant care advice:', error);
    throw error;
  }
} 