import sqlite3 from "sqlite3";
import { Insight } from "./models";
import { AutonomousGuardrail } from "./guardrail";

// Helper for Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class CognitionFabric {
  private db: sqlite3.Database;
  private guardrail: AutonomousGuardrail;

  constructor() {
    this.db = new sqlite3.Database("./fabric_ledger.db");
    this.guardrail = new AutonomousGuardrail(0.8);
    this.initDb();
  }

  private initDb() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS insights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          problem_signature TEXT UNIQUE,
          solution TEXT,
          confidence_score REAL,
          source_agent_id TEXT,
          metadata TEXT,
          vector_embedding TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });
  }

  public publishInsight(insight: Insight, vector: number[], callback: (i: Insight) => void): {success: boolean, message: string} {
    const isSafe = this.guardrail.validate(insight);
    if (!isSafe.valid) {
      return { success: false, message: `[Guardrail BLOCK] 🛑 ${isSafe.reason}` };
    }

    const stmt = this.db.prepare(`
      INSERT INTO insights (problem_signature, solution, confidence_score, source_agent_id, metadata, vector_embedding)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(problem_signature) DO UPDATE SET
        solution = excluded.solution,
        confidence_score = excluded.confidence_score,
        source_agent_id = excluded.source_agent_id,
        metadata = excluded.metadata,
        vector_embedding = excluded.vector_embedding,
        timestamp = CURRENT_TIMESTAMP
      WHERE excluded.confidence_score > insights.confidence_score
    `);

    const metaStr = JSON.stringify(insight.metadata || {});
    const vecStr = JSON.stringify(vector);

    stmt.run([
      insight.problem_signature,
      insight.solution,
      insight.confidence_score,
      insight.source_agent_id,
      metaStr,
      vecStr
    ], function(err) {
      if (err) console.error("SQLite Error:", err);
      // We only callback if rows were changed (meaning it wasn't ignored due to lower confidence)
      if (this.changes > 0) {
        callback(insight);
      }
    });

    return { success: true, message: "Insight committed to Fabric Ledger." };
  }

  public getAllInsights(callback: (insights: Insight[]) => void) {
    this.db.all("SELECT problem_signature, solution, confidence_score, source_agent_id, metadata, timestamp FROM insights ORDER BY id DESC", [], (err, rows: any[]) => {
      if (err) {
        callback([]);
        return;
      }
      callback(rows.map(r => ({
        ...r,
        metadata: JSON.parse(r.metadata)
      })));
    });
  }

  // SEMANTIC VECTOR SEARCH
  public findSemanticMatch(queryVector: number[], similarityThreshold: number = 0.85, callback: (match: Insight | null, similarity: number) => void) {
    this.db.all("SELECT problem_signature, solution, confidence_score, source_agent_id, metadata, vector_embedding FROM insights", [], (err, rows: any[]) => {
      if (err || !rows || rows.length === 0) {
        callback(null, 0);
        return;
      }

      let bestMatch: Insight | null = null;
      let highestSimilarity = -1;

      for (const row of rows) {
        if (!row.vector_embedding) continue;
        const storedVector = JSON.parse(row.vector_embedding);
        const sim = cosineSimilarity(queryVector, storedVector);
        
        if (sim > highestSimilarity) {
          highestSimilarity = sim;
          bestMatch = {
            problem_signature: row.problem_signature,
            solution: row.solution,
            confidence_score: row.confidence_score,
            source_agent_id: row.source_agent_id,
            metadata: JSON.parse(row.metadata)
          };
        }
      }

      if (highestSimilarity >= similarityThreshold && bestMatch) {
        callback(bestMatch, highestSimilarity);
      } else {
        callback(null, highestSimilarity);
      }
    });
  }

  // Wipes the database for hackathon demos
  public clearFabric(callback: () => void) {
    this.db.run("DELETE FROM insights", [], (err) => {
      if (err) console.error("Error clearing DB:", err);
      callback();
    });
  }
}
