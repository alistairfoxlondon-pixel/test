import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key-for-build");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define Zod schema for structured output
const ComplianceSchema = z.object({
  home_country: z.string(),
  destination_country: z.string(),
  visa_type: z.string(),
  income_requirement: z.string(),
  tax_threshold: z.string(),
  double_taxation_treaty: z.string(),
  employer_risk: z.string(),
  summary_paragraph: z.string(),
  seo_description: z.string(),
});

type ComplianceData = z.infer<typeof ComplianceSchema>;

const countries = ["united-states", "united-kingdom", "canada", "germany", "australia"];
const destinations = ["spain", "portugal", "united-arab-emirates", "thailand", "indonesia"];

async function generateData() {
  const outputDir = path.join(process.cwd(), "data", "routes");
  await fs.mkdir(outputDir, { recursive: true });

  const dataset: Record<string, ComplianceData> = {};
  const datasetPath = path.join(outputDir, "dataset.json");

  for (const home of countries) {
    for (const dest of destinations) {
      if (home === dest) continue;

      const pairKey = `${home}-to-${dest}`;
      const jsonFilePath = path.join(outputDir, `${pairKey}.json`);

      // Check if data already exists to cache/prevent unnecessary API calls
      try {
        await fs.access(jsonFilePath);
        console.log(`[Cache] Data for ${pairKey} already exists. Skipping.`);
        const existingData = JSON.parse(await fs.readFile(jsonFilePath, "utf-8"));
        dataset[pairKey] = existingData;
        continue;
      } catch {
        // File does not exist, proceed to generate
      }

      console.log(`Generating data for ${pairKey}...`);

      const prompt = `
        Act as a Principal Full-Stack Software Engineer, Database Architect, and Senior SEO Growth Specialist.
        Generate a detailed remote work compliance profile for a worker moving from the ${home.replace("-", " ")} to ${dest.replace("-", " ")}.

        Provide the response strictly as a JSON object matching this schema:
        {
          "home_country": "The home country name",
          "destination_country": "The destination country name",
          "visa_type": "The relevant digital nomad or remote work visa available in the destination country",
          "income_requirement": "The minimum income required for the visa, in local currency and USD equivalent",
          "tax_threshold": "Details on the tax residency threshold (e.g. 183-day rule) in the destination",
          "double_taxation_treaty": "Information about any double taxation treaty between the two countries, answering Yes/No with context",
          "employer_risk": "Corporate Employer Risk Management details (How to avoid triggering a permanent establishment)",
          "summary_paragraph": "A highly professional summary paragraph of the compliance requirements.",
          "seo_description": "A 150-160 character meta description for SEO."
        }

        Do not include any markdown formatting like \`\`\`json. Return only the raw JSON string.
      `;

      try {
        if (!process.env.GEMINI_API_KEY) {
           console.log("No GEMINI_API_KEY found, using fallback data.");
           throw new Error("Missing API Key");
        }
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean potential markdown from response
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const rawJson = JSON.parse(cleanedText);
        const validatedData = ComplianceSchema.parse(rawJson);

        dataset[pairKey] = validatedData;
        await fs.writeFile(jsonFilePath, JSON.stringify(validatedData, null, 2));

        // Implement a slight delay for rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Generation failed for ${pairKey}:`, error);

        // Fallback Template Data in case API fails
        console.log(`Using fallback template for ${pairKey}.`);
        const fallbackData: ComplianceData = {
           home_country: home.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
           destination_country: dest.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
           visa_type: "Digital Nomad Visa / Equivalent",
           income_requirement: "Varies depending on exact visa chosen. Typically ~2-4x local minimum wage.",
           tax_threshold: "Usually, the 183-day physical residency rule triggers full fiscal tax status in the destination country.",
           double_taxation_treaty: `Requires consultation with a tax professional regarding treaties between ${home} and ${dest}.`,
           employer_risk: "High tracking risk. Permanent Establishment (PE) triggers if business-critical activities happen in-country.",
           summary_paragraph: `Navigating legal employment compliance as a remote specialist migrating from ${home} to ${dest} requires structural alignment of personal tax residency rules and corporate infrastructure frameworks.`,
           seo_description: `Complete remote work compliance guide for moving from ${home} to ${dest}. Tax rules, visa requirements, and employer risk mitigation strategies.`
        };
        dataset[pairKey] = fallbackData;
        await fs.writeFile(jsonFilePath, JSON.stringify(fallbackData, null, 2));
      }
    }
  }

  await fs.writeFile(datasetPath, JSON.stringify(dataset, null, 2));
  console.log("✅ Data generation complete. Dataset saved to data/routes/dataset.json");
}

generateData().catch(console.error);
