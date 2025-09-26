# backend.py
import boto3, json
import pandas as pd
import numpy as np
import faiss
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

# ---------- AWS BEDROCK CLIENT ----------
client = boto3.client("bedrock-runtime", region_name="us-east-1")

def get_embedding(text: str, dim: int = 1024):
    import time
    import botocore
    body = {
        "inputText": text,
        "dimensions": dim,
        "normalize": True,
        "embeddingTypes": ["float"]
    }
    max_retries = 5
    delay = 1
    for attempt in range(max_retries):
        try:
            resp = client.invoke_model(
                modelId="amazon.titan-embed-text-v2:0",
                body=json.dumps(body)
            )
            result = json.loads(resp["body"].read())
            return np.array(result["embedding"], dtype="float32")
        except botocore.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "ThrottlingException":
                print(f"Throttled by Bedrock, retrying in {delay} seconds...")
                time.sleep(delay)
                delay *= 2  # Exponential backoff
            else:
                raise
        except botocore.errorfactory.ThrottlingException:
            print(f"Throttled by Bedrock, retrying in {delay} seconds...")
            time.sleep(delay)
            delay *= 2
    raise Exception("Max retries exceeded for Bedrock embedding request")


# ---------- LOAD + EMBED DATA ----------

import os
parquet_path = "cs_jobs_with_embeddings.parquet"
if os.path.exists(parquet_path):
    print("Loading embeddings from .parquet file...")
    df = pd.read_parquet(parquet_path)
    embeddings = np.array(df["embedding"].tolist(), dtype="float32")
else:
    print("Loading dataset...")
    df = pd.read_csv("cs_jobs_dataset.csv")
    # Combine text fields
    df["text_to_embed"] = (
        df["job_title"].fillna("") + " -- " +
        df["job_description"].fillna("") + " -- Skills: " +
        df["required_skills"].fillna("")
    )
    print("Generating embeddings...")
    import time
    embeddings = []
    for txt in df["text_to_embed"]:
        embeddings.append(get_embedding(txt))
        time.sleep(1)  # Wait 1 second between requests to avoid throttling
    embeddings = np.vstack(embeddings)
    # Save embeddings for later reuse
    df["embedding"] = embeddings.tolist()
    df.to_parquet(parquet_path, index=False)
    print("Saved embeddings ✅")

# ---------- BUILD FAISS INDEX ----------
dim = embeddings.shape[1]
index = faiss.IndexFlatIP(dim)  # cosine similarity if normalized
faiss.normalize_L2(embeddings)
index.add(embeddings)

# ---------- FASTAPI APP ----------
app = FastAPI()

class Query(BaseModel):
    resume_text: str
    job_title: str

@app.post("/search")
def search(q: Query):
    # --- Nova Pro integration for resume skill extraction ---
    nova_client = boto3.client("bedrock-runtime", region_name="us-east-1")
    prompt = f"""
    Extract a list of skills from the following resume text. Return only a comma-separated list of skills.
    Resume:
    {q.resume_text}
    """
    try:
        response = nova_client.invoke_model(
            modelId="amazon.nova-pro-v1:0",  # Nova Pro model ID
            body=json.dumps({"prompt": prompt, "max_tokens": 256})
        )
        result = json.loads(response["body"].read())
        skill_str = result.get("completion", "")
        resume_skills = [s.strip().lower() for s in skill_str.split(",") if s.strip()]
    except Exception as e:
        print(f"Nova Pro skill extraction failed: {e}")
        resume_skills = []

    # --- Find job by title ---
    job_row = df[df["job_title"].str.lower() == q.job_title.strip().lower()]
    if job_row.empty:
        return {"error": "Job title not found", "resume_skills": resume_skills}
    job_skills_raw = job_row.iloc[0]["required_skills"]
    job_skills = [s.strip().lower() for s in job_skills_raw.split(",") if s.strip()]

    # --- Compare skills ---
    skill_matches = []
    for skill in job_skills:
        match = skill in resume_skills
        skill_matches.append({"skill": skill, "matched": match})

    # --- Similarity score ---
    similarity = len([m for m in skill_matches if m["matched"]]) / max(1, len(skill_matches))

    return {
        "job_title": q.job_title,
        "job_skills": job_skills,
        "resume_skills": resume_skills,
        "skill_matches": skill_matches,
        "similarity": similarity
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
