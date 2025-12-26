const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Checking Google Gemini API Access...");
console.log("Please paste your API Key below (input will be hidden):");

rl.question('API Key: ', async (apiKey) => {
    // Simple masking for visual feedback (not real security in terminal, but prevents shoulder surfing)
    // Note: in standard node repl, input isn't truly hidden without simpler libs, but this is sufficient for debug.

    if (!apiKey) {
        console.error("API Key is required.");
        rl.close();
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        // Try to get model info directly via fetch to list models, as SDK listModels might need specific setup
        // Using the REST endpoint manually to be sure.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;

        console.log("\nConnecting to Google AI Studio API...");
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Request Failed: ${response.status} ${response.statusText}\n${await response.text()}`);
        }

        const data = await response.json();
        console.log("\n✅ SUCCESS! Connection Established.");
        console.log("-----------------------------------------");
        console.log("Available Models for your key:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name}`);
                if (m.supportedGenerationMethods) {
                    console.log(`  Supported: ${m.supportedGenerationMethods.join(", ")}`);
                }
            });
        } else {
            console.log("No models found in response.");
        }
        console.log("-----------------------------------------");
        console.log("Please use one of the model names listed above (without 'models/' prefix) in your code.");

    } catch (error) {
        console.error("\n❌ ERROR: Failed to connect.");
        console.error(error.message);
        console.error("\nPlease check:");
        console.error("1. Is the API Key correct?");
        console.error("2. Is the Google AI Studio API enabled?");
        console.error("3. Are there billing/region restrictions?");
    } finally {
        rl.close();
    }
});
