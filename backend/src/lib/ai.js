const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b"; 

async function callGroq(prompt, temperature) {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        if ([429, 500, 502, 503].includes(res.status) && attempt < 3) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }
        throw new Error(`Groq API error ${res.status}: ${text}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Groq returned no content");
      return JSON.parse(content);
    } catch (err) {
      lastErr = err;
      if (attempt >= 3) throw err;
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
  throw lastErr;
}

// 1) Generate 8 concise OA-style + interview practice questions
export async function generateQuestions({ jobTitle, company, jobDescription }) {
  const prompt = `You are an expert interviewer creating a QUICK practice set (online-assessment + interview style).
Role Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription}

STYLE RULES:
- Make questions crisp and specific — like OA / real interview rounds.
- Each question must be answerable in 2-5 sentences (or a short code idea). NO essay-length questions.
- Favor core fundamentals, definitions, comparisons, trade-offs, time/space complexity, debugging, and short scenarios.
- Avoid vague, open-ended questions that need very long answers.
- Base technical questions on the skills in the job description.

Generate EXACTLY 8 questions with the mix that is currently focused on job description skills and used recently in OA and interviews.
Each needs a "difficulty" of "easy", "medium", or "hard".
Return ONLY JSON in this exact shape:
{ "questions": [ { "content": "...", "category": "technical", "difficulty": "medium" } ] }`;

  const result = await callGroq(prompt, 0.7);
  return result.questions;
}

// 2) Score one answer (temp 0.2). Short answers are fine if correct.
export async function evaluateAnswer({ question, answer }) {
  const prompt = `You are a fair but discerning interview evaluator. Score the answer from 0 to 100. (can be lineant if he gets the approach but tell whats missing)

Answers are expected to be CONCISE (2-5 sentences). Do NOT penalize brevity if the answer is correct and complete for the question.

Judge by question type:
- Technical/system_design: accuracy, correct reasoning, right key points.
- Behavioral/situational: relevant, clear, sensible judgment.

Scoring scale:
- 0-20: empty, off-topic, or generic filler with no real content.
- 30-50: on-topic but partly wrong or missing key points.
- 60-89: correct and clear with the main points covered.
- 90-100: correct, precise, and complete.
Only score below 30 for vague, off-topic, or filler answers.

Question: ${question}
Candidate's answer: ${answer}

Return ONLY JSON: { "score": <integer 0-100>, "feedback": "1-2 sentences on the answer plus one concrete improvement" }`;

  const result = await callGroq(prompt, 0.2);
  const score = Math.min(100, Math.max(0, Math.round(result.score)));
  return { score, feedback: result.feedback };
}