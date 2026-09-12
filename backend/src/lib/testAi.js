import "dotenv/config";
import { generateQuestions, evaluateAnswer } from "./ai.js";

async function main() {
  console.log("⏳ Generating questions...\n");
  const questions = await generateQuestions({
    jobTitle: "Backend Developer",
    company: "Acme Corp",
    jobDescription: "Node.js, Express, MongoDB, REST APIs, JWT authentication.",
  });
  console.log(JSON.stringify(questions, null, 2));
  console.log(`\n✅ Got ${questions.length} questions\n`);

  console.log("⏳ Scoring a sample answer...\n");
  const result = await evaluateAnswer({
    question: questions[0].content,
    answer:
      "I'd hash passwords with bcrypt, issue a JWT on login, and verify it in Express middleware that sets req.userId.",
  });
  console.log(result);
}

main().catch((err) => console.error("❌", err.message));