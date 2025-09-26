import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import axios from 'axios';
import csvParser from 'csv-parser';
import pdf from 'pdf-parse';
import fs from 'fs';
import courses from './courses.json'; // Make sure this file exists in the same folder

export const config = {
  api: { bodyParser: false }, // Required to use `formidable`
};

const NOVA_PRO_API_KEY = process.env.NOVA_API_KEY!;
const NOVA_PRO_URL = 'https://api.nova-pro.com/v1/extract';

// -------------------- Helpers --------------------

async function readJDDataset(filePath: string): Promise<any[]> {
  const results: any[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function extractResumeText(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const pdfData = await pdf(dataBuffer);
    if (pdfData?.text) return pdfData.text;
  } catch {
    // fallback for non-PDF (e.g., TXT)
  }
  return dataBuffer.toString('utf-8');
}

async function extractSkillsFromResume(text: string): Promise<string[]> {
  const response = await axios.post(
    NOVA_PRO_URL,
    { text },
    {
      headers: {
        Authorization: `Bearer ${NOVA_PRO_API_KEY}`,
      },
    }
  );
  return response.data.skills || [];
}

function compareSkills(jdSkills: string[], resumeSkills: string[]) {
  const jdSet = new Set(jdSkills.map((s) => s.toLowerCase().trim()));
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase().trim()));

  const matchingSkills = [...jdSet].filter((s) => resumeSet.has(s));
  const missingSkills = [...jdSet].filter((s) => !resumeSet.has(s));

  const matchPercentage = (matchingSkills.length / jdSet.size) * 100;

  const recommendedCourses = missingSkills
    .map((skill) => courses[skill])
    .filter(Boolean)
    .flat();

  return { matchPercentage, matchingSkills, missingSkills, recommendedCourses };
}

// -------------------- API Handler --------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable({ multiples: false, uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File parsing error' });

    try {
      const resumeFile = files.resume as File | undefined;
      const jdFile = files.jdDataset as File | undefined;
      const jobTitle = fields.jobTitle as string;

      if (!resumeFile || !jdFile || !jobTitle) {
        return res.status(400).json({ error: 'Resume, JD dataset, or job title missing' });
      }

      const resumePath = resumeFile.filepath;
      const jdPath = jdFile.filepath;

      const resumeText = await extractResumeText(resumePath);
      const resumeSkills = await extractSkillsFromResume(resumeText);
      const jdData = await readJDDataset(jdPath);

      const selectedJob = jdData.find((row) => row.job_title === jobTitle);
      if (!selectedJob) {
        return res.status(404).json({ error: 'Job title not found in dataset' });
      }

      const jdSkills = selectedJob.required_skills?.split(',') || [];
      const comparison = compareSkills(jdSkills, resumeSkills);

      return res.status(200).json({
        jobTitle: selectedJob.job_title,
        jobDescription: selectedJob.job_description,
        resumeSkills,
        ...comparison,
      });
    } catch (error: any) {
      console.error('Processing error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}
