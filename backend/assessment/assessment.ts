import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("assessment", { migrations: "./migrations" });

export interface CareerMatch {
  title: string;
  matchScore: number;
  description: string;
}

export interface AssessmentResult {
  userId: string;
  completedAt: string;
  strengths: string[];
  values: string[];
  personalityType: string;
  careerMatches: CareerMatch[];
}

export interface GetAssessmentResponse {
  result: AssessmentResult | null;
}

// GET /assessment/:userId
export const getAssessment = api(
  { expose: true, method: "GET", path: "/assessment/:userId" },
  async ({ userId }: { userId: string }): Promise<GetAssessmentResponse> => {
    const row = await db.queryRow`
      SELECT user_id, completed_at, strengths, values, personality_type, career_matches
      FROM assessments WHERE user_id = ${userId}
    `;
    if (!row) return { result: null };
    return {
      result: {
        userId: row.user_id,
        completedAt: row.completed_at,
        strengths: JSON.parse(row.strengths),
        values: JSON.parse(row.values),
        personalityType: row.personality_type,
        careerMatches: JSON.parse(row.career_matches),
      },
    };
  }
);

export interface SubmitAssessmentParams {
  userId: string;
  strengths: string[];
  values: string[];
  personalityType: string;
}

// POST /assessment — Submit answers, generate career matches via AI
export const submitAssessment = api(
  { expose: true, method: "POST", path: "/assessment" },
  async (params: SubmitAssessmentParams): Promise<GetAssessmentResponse> => {
    const now = new Date().toISOString();

    // TODO: Replace with real AI-generated matches from Claude/OpenAI
    const careerMatches: CareerMatch[] = [
      { title: "Marketing Analyst", matchScore: 88, description: "Strategic thinking & data visualization." },
      { title: "Data Analyst",      matchScore: 84, description: "Quantitative analysis & predictive modeling." },
      { title: "Product Manager",   matchScore: 72, description: "User-centric design & agile leadership." },
    ];

    await db.exec`
      INSERT INTO assessments (user_id, completed_at, strengths, values, personality_type, career_matches)
      VALUES (
        ${params.userId}, ${now},
        ${JSON.stringify(params.strengths)},
        ${JSON.stringify(params.values)},
        ${params.personalityType},
        ${JSON.stringify(careerMatches)}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        completed_at = excluded.completed_at,
        strengths = excluded.strengths,
        values = excluded.values,
        personality_type = excluded.personality_type,
        career_matches = excluded.career_matches
    `;

    return {
      result: { userId: params.userId, completedAt: now, careerMatches, strengths: params.strengths, values: params.values, personalityType: params.personalityType },
    };
  }
);
