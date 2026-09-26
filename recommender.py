"""
Hybrid recommendation engine.

Deliberately split into a training half and a serving half:

  ContentBasedRecommender  — TF-IDF over resource text, matched against the
                              STUDENT'S OWN PROFILE TEXT (not just past
                              interactions, so it works from message one —
                              this is what solves cold start).

  CollaborativeRecommender — a student x resource ratings matrix, factorized
                              with TruncatedSVD (matrix factorization).

  HybridRecommender         — blends the two. `.train()` does all the
                              fitting (called only by train.py, offline).
                              `.recommend()` does none of it — just
                              `vectorizer.transform` and row lookups against
                              models already fit and loaded from disk. This
                              is what the live app calls on every request.
"""
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD

INTERACTION_WEIGHTS = {"Viewed": 2, "Clicked": 3, "Liked": 4, "Completed": 5}


def effective_rating(rating, interaction_type):
    """Turn an explicit rating (if given) or an implicit action into a 1-5 signal."""
    if rating:
        return rating
    return INTERACTION_WEIGHTS.get(interaction_type, 2)


class ContentBasedRecommender:
    def __init__(self, resources_df: pd.DataFrame):
        self.df = resources_df.reset_index(drop=True).copy()
        self.df["soup"] = (
            self.df["title"] + " " + self.df["topic"] + " " + self.df["tags"] + " "
            + self.df["description"] + " " + self.df["difficulty"] + " " + self.df["type"]
        )
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.matrix = self.vectorizer.fit_transform(self.df["soup"])
        self._id_index = self.df.set_index("id")

    def score_profile(self, interest_text: str, skill_level: str = None, preferred_type: str = None) -> pd.Series:
        """Score every resource against a student's stated interest/goal text. No fitting here."""
        query_vec = self.vectorizer.transform([interest_text])
        sims = cosine_similarity(query_vec, self.matrix).flatten()
        scores = pd.Series(sims, index=self.df["id"])

        boost = pd.Series(1.0, index=self.df["id"])
        if skill_level:
            same_level = (self._id_index["difficulty"] == skill_level).reindex(scores.index)
            # Give a 20% boost to matching difficulty
            boost[same_level] *= 1.20
            # Slight penalty to non-matching difficulty
            boost[~same_level] *= 0.80
            
        if preferred_type:
            same_type = (self._id_index["type"] == preferred_type).reindex(scores.index)
            # Massive boost to the preferred format
            boost[same_type] *= 3.0
            # Massive penalty to non-preferred formats so they only show if nothing else exists
            boost[~same_type] *= 0.1

        scores = scores * boost
        if scores.max() > 0:
            scores = scores / scores.max()
        return scores


class CollaborativeRecommender:
    def __init__(self, interactions_df: pd.DataFrame, resource_ids):
        self.resource_ids = list(resource_ids)
        self.user_factors = None
        self.matrix_df = pd.DataFrame(columns=self.resource_ids)

        if interactions_df.empty:
            return

        interactions_df = interactions_df.copy()
        interactions_df["effective_rating"] = interactions_df.apply(
            lambda row: effective_rating(row.get("rating"), row.get("interaction_type")), axis=1
        )
        pivot = interactions_df.pivot_table(
            index="student_id", columns="resource_id",
            values="effective_rating", aggfunc="mean", fill_value=0,
        )
        for rid in self.resource_ids:
            if rid not in pivot.columns:
                pivot[rid] = 0
        pivot = pivot[self.resource_ids]
        self.matrix_df = pivot

        n_components = min(10, min(pivot.shape) - 1)
        if n_components < 1:
            return

        self.svd = TruncatedSVD(n_components=n_components, random_state=42)
        user_factors = self.svd.fit_transform(pivot.values)
        item_factors = self.svd.components_
        self.reconstructed = pd.DataFrame(
            user_factors @ item_factors, index=pivot.index, columns=pivot.columns,
        )
        self.user_factors = user_factors

    def score_student(self, student_id: str):
        """Returns a 0-1 normalized score per resource, or None if this
        student has no interaction history in the currently trained model
        (true cold start, or interacted only after the last training run)."""
        if self.user_factors is None or student_id not in self.matrix_df.index:
            return None
        row = self.reconstructed.loc[student_id].copy()
        if row.max() > row.min():
            row = (row - row.min()) / (row.max() - row.min())
        else:
            row[:] = 0
        return row


class HybridRecommender:
    def __init__(self, content_model: ContentBasedRecommender, collab_model: CollaborativeRecommender):
        self.content_model = content_model
        self.collab_model = collab_model

    @classmethod
    def train(cls, resources_df: pd.DataFrame, interactions_df: pd.DataFrame) -> "HybridRecommender":
        content_model = ContentBasedRecommender(resources_df)
        collab_model = CollaborativeRecommender(interactions_df, resources_df["id"])
        return cls(content_model, collab_model)

    def recommend(
        self,
        student: dict,
        top_n: int = 5,
        n_interactions: int = 0,
        seen_ids: set = None,
        exclude_seen: bool = True,
    ) -> pd.DataFrame:
        content_scores = self.content_model.score_profile(
            student["interest"], student.get("skill_level"), student.get("preferred_type"),
        )
        cf_scores = self.collab_model.score_student(student["id"])

        cf_weight = 0.0 if cf_scores is None else min(0.7, n_interactions / 10)
        content_weight = 1 - cf_weight

        if cf_scores is None:
            final = content_scores
            reason = "content match (no collaborative signal yet for this student in the current trained model)"
        else:
            aligned_cf = cf_scores.reindex(content_scores.index).fillna(0)
            final = content_weight * content_scores + cf_weight * aligned_cf
            reason = f"hybrid — {int(content_weight * 100)}% profile match, {int(cf_weight * 100)}% similar learners"

        result = self.content_model.df.set_index("id").drop(columns=["soup"]).copy()
        result["score"] = final
        result["reason"] = reason

        if exclude_seen and seen_ids:
            result = result[~result.index.isin(seen_ids)]

        return result.sort_values("score", ascending=False).head(top_n).reset_index()
