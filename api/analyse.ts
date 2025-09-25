import { VercelRequest, VercelResponse } from "@vercel/node";
import formidable from "formidable";
// TypeScript: declare module for pdf-parse if types are missing
declare module "pdf-parse";
import fs from "fs";
import axios from "axios";
import csvParser from "csv-parser"; // if JD dataset is CSV
import * as pdf from "pdf-parse"; // optional if resume is PDF

const NOVA_PRO_API_KEY = process.env.NOVA_API_KEY!;
const NOVA_PRO_URL = "https://api.nova-pro.com/v1/extract";

// Helper: Read CSV JD dataset
async function readJDDataset(filePath: string) {
  const results: any[] = [];
  return new Promise<any[]>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

// Helper: Extract resume text (PDF or TXT)
async function extractResumeText(filePath: string) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer).catch(() => null);
  if (pdfData?.text) return pdfData.text;
  return dataBuffer.toString("utf-8"); // fallback for TXT
}

// Call Nova Pro to extract skills
async function extractSkillsFromResume(text: string) {
  const response = await axios.post(
    NOVA_PRO_URL,
    { text },
    { headers: { Authorization: `Bearer ${NOVA_PRO_API_KEY}` } }
  );
  return response.data.skills || [];
}

// Cosine similarity / skill comparison
function compareSkills(jdSkills: string[], resumeSkills: string[]) {
  const jdSet = new Set(jdSkills.map((s) => s.toLowerCase()));
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));

  const matchingSkills = [...jdSet].filter((s) => resumeSet.has(s));
  const missingSkills = [...jdSet].filter((s) => !resumeSet.has(s));

  const matchPercentage = (matchingSkills.length / jdSet.size) * 100;
  return { matchPercentage, matchingSkills, missingSkills };
}

// Serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Parse multipart form data using formidable
  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });
  form.parse(req, async (err: any, fields: formidable.Fields, files: formidable.Files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "File parsing error" });
    }
    try {
  const resumeFile = files.resume;
  const jdFile = files.jdDataset;
  if (!resumeFile || !jdFile) return res.status(400).json({ error: "Files missing" });

  // Get file paths (handle array or single file)
      const resumePath = Array.isArray(resumeFile)
        ? (resumeFile[0] as formidable.File).filepath
        : (resumeFile as formidable.File).filepath;
      const jdPath = Array.isArray(jdFile)
        ? (jdFile[0] as formidable.File).filepath
        : (jdFile as formidable.File).filepath;

  // Extract resume text
  const resumeText = await extractResumeText(resumePath);

  // Extract skills using Nova Pro
  const resumeSkills = await extractSkillsFromResume(resumeText);

  // Read JD dataset
  const jdData = await readJDDataset(jdPath);
  const jdSkills = jdData[0]?.required_skills?.split(",") || []; // adjust depending on CSV structure

  // Compare skills
  const comparison = compareSkills(jdSkills, resumeSkills);

  res.status(200).json({ ...comparison });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
}
