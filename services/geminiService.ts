
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, JobDescription, GenerationSettings, TailoredResume, TailoredCoverLetter } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas ---

const userProfileSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    headline: { type: Type.STRING },
    contactInfo: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        website: { type: Type.STRING },
        linkedIn: { type: Type.STRING },
        github: { type: Type.STRING },
      },
    },
    summary: { type: Type.STRING },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
        },
      },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          isCurrent: { type: Type.BOOLEAN },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          role: { type: Type.STRING },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
        },
      },
    },
    certifications: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                issuer: { type: Type.STRING },
                date: { type: Type.STRING }
            }
        }
    },
    interests: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["fullName"],
};

const jobDescriptionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    company: { type: Type.STRING },
    location: { type: Type.STRING },
    requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
    preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["title", "company"],
};

// --- API Methods ---

export const parseUserProfile = async (rawText: string): Promise<UserProfile> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract a structured UserProfile from this resume/text. Ensure all dates are strings. \n\nInput Text:\n${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: userProfileSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as UserProfile;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Error parsing user profile:", error);
    throw error;
  }
};

export const parseJobDescription = async (rawText: string): Promise<JobDescription> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract a structured JobDescription from this job posting text. Focus on requirements and keywords.\n\nInput Text:\n${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: jobDescriptionSchema,
      },
    });

    if (response.text) {
        const data = JSON.parse(response.text) as JobDescription;
        data.pastedText = rawText;
        return data;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Error parsing job description:", error);
    throw error;
  }
};

export const generateTailoredResume = async (
  profile: UserProfile,
  job: JobDescription,
  settings: GenerationSettings
): Promise<TailoredResume> => {
  try {
    const prompt = `
      You are a senior technical recruiter and professional resume writer.
      Your task is to generate a tailored resume in GitHub-flavored Markdown based on the provided User Profile and Job Description.

      Configuration:
      - Tone: ${settings.tone}
      - Max Skills: ${settings.skillsMaxCount}
      - Max Experience Entries: ${settings.experienceMaxItems}
      - Max Project Entries: ${settings.projectsMaxItems}
      - Target Length: ${settings.targetLength}
      - Included Sections: ${settings.includeSections.join(", ")}
      - Show Keyword Match Comments: ${settings.showKeywordMatchComments}

      Instructions:
      1. Analyze the Job Description to identify key requirements, technologies, and "soft skills".
      2. Select the most relevant experiences and projects from the User Profile.
      3. Rewrite bullet points to emphasize impact and alignment with the Job Description keywords. Use action verbs.
      4. Do NOT invent experiences or skills. Only use what is provided in the User Profile.
      5. If "Show Keyword Match Comments" is true, add HTML comments (<!-- matched: keyword -->) next to tailored lines.
      6. Output clean, professional Markdown. Use h1 for Name, h2 for Sections.

      User Profile:
      ${JSON.stringify(profile)}

      Job Description:
      ${JSON.stringify(job)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    const markdown = response.text || "";

    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      markdown: markdown,
      matchSummary: {
        overallScore: 85,
        hardSkillCoverage: 0,
        softSkillCoverage: 0,
        topMatchedKeywords: job.keywords?.slice(0, 5) || [],
        missingImportantKeywords: []
      }
    };
  } catch (error) {
    console.error("Error generating resume:", error);
    throw error;
  }
};

export const generateCoverLetter = async (
  profile: UserProfile,
  job: JobDescription,
  settings: GenerationSettings
): Promise<TailoredCoverLetter> => {
  try {
    const prompt = `
      You are a professional career coach and expert writer. 
      Write a highly persuasive, tailored cover letter for the following job application.

      Job: ${job.title} at ${job.company}
      Candidate: ${profile.fullName}

      Guidelines:
      1. Use a ${settings.tone} tone.
      2. Address the hiring manager (use "Hiring Manager at ${job.company}" if name is unknown).
      3. Focus on how the candidate's specific experiences in the profile solve the problems or meet the needs mentioned in the job description.
      4. Include specific keywords from the job description naturally.
      5. Keep it to approximately 3-4 paragraphs.
      6. Start with a strong hook and end with a clear call to action.
      7. Do not include placeholder text like "[Date]" - if you need a date, use today's date: ${new Date().toLocaleDateString()}.
      8. Use professional letter formatting in Markdown.

      User Profile: ${JSON.stringify(profile)}
      Job Description: ${JSON.stringify(job)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      content: response.text || ""
    };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
};
