import spacy
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Singletons loaded at startup
nlp = spacy.load("en_core_web_sm")
vader = SentimentIntensityAnalyzer()

SKILL_KEYWORDS = {
    "technical": ["python","java","sql","docker","kubernetes","aws","react",
                  "fastapi","mongodb","redis","machine learning","api"],
    "soft":      ["leadership","teamwork","communication","problem-solving",
                  "collaboration","ownership","mentoring"],
}

STAR_WORDS = {
    "situation": ["situation","context","background","faced"],
    "task":      ["task","goal","responsible","objective"],
    "action":    ["action","did","implemented","built","led","fixed"],
    "result":    ["result","outcome","achieved","improved","reduced","increased"],
}

def extract_skills(text: str) -> dict:
    doc = nlp(text.lower())
    tokens = {t.lemma_ for t in doc if not t.is_stop}
    found = {cat: [s for s in kws if s in tokens or any(s in chunk.text.lower() for chunk in doc.noun_chunks)]
             for cat, kws in SKILL_KEYWORDS.items()}
    # Modified original logic slightly to catch phrases in noun chunks if needed, but sticking closely to Plan.md:
    found = {cat: [s for s in kws if s in text.lower()]
             for cat, kws in SKILL_KEYWORDS.items()}
    return found

def confidence_score(text: str) -> dict:
    score = vader.polarity_scores(text)["compound"]
    label = "confident" if score > 0.4 else "hesitant" if score < 0 else "neutral"
    return {"compound": round(score, 3), "label": label}

def tfidf_similarity(answer: str, ideal: str) -> float:
    if not answer.strip() or not ideal.strip():
        return 0.0
    vec = TfidfVectorizer().fit_transform([answer, ideal])
    sim = cosine_similarity(vec[0], vec[1])[0][0]
    return round(float(sim), 3)

def star_check(text: str) -> dict:
    text_lower = text.lower()
    hits = {k: any(w in text_lower for w in ws)
            for k, ws in STAR_WORDS.items()}
    return {"hits": hits, "score": sum(hits.values())}

def run_nlp_pipeline(answer: str, ideal_answer: str) -> dict:
    return {
        "skills":     extract_skills(answer),
        "confidence": confidence_score(answer),
        "similarity": tfidf_similarity(answer, ideal_answer),
        "star":       star_check(answer),
    }
