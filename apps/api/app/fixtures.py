"""
v0 fixtures: deterministic stub data. Honest structure, no fake confidence.
"""
from app.models import (
    Article,
    ArticleBlock,
    ArticleExperience,
    Claim,
    ClaimType,
    ClaimSupport,
    ConfidenceLevel,
    EvidenceSpan,
    ExperienceStep,
    Node,
    NodeType,
    Question,
    Source,
    SourceType,
    TraceNodeRef,
    TracePreview,
    ArticleMarket,
    MarketItem,
    MarketCategory,
    ArticleStudyGuide,
    StudyBlock,
    MediaReference,
    MediaInterpretation,
    MediaSummaryBlock,
    MediaTranscriptBlock,
    OrganizationProfile,
    OrganizationKind,
    OrganizationLinkedItem,
    OrganizationLinkedItemKind,
    OrganizationRelatedSource,
    OrganizationRelatedClaim,
    EcologicalEntity,
)

# Two example nodes (optional imageUrl for search result thumbnails)
NODES = {
    "node-coffee-cup": Node(
        id="node-coffee-cup",
        name="Disposable coffee cup",
        nodeType=NodeType.product,
        displayLabel="Coffee cup",
    ),
    "node-uhaul-box": Node(
        id="node-uhaul-box",
        name="U-Haul moving box",
        nodeType=NodeType.product,
        displayLabel="U-Haul box",
    ),
    "node-poison-ivy": Node(
        id="node-poison-ivy",
        name="Poison ivy",
        nodeType=NodeType.other,
        displayLabel="Poison ivy",
    ),
    "node-oak": Node(
        id="node-oak",
        name="Oak tree",
        nodeType=NodeType.other,
        displayLabel="Oak tree",
    ),
}

# Claims — every claim has confidence; support set or derived. Mix so blocks have visible distribution.
CLAIMS = {
    "claim-1": Claim(
        id="claim-1",
        text="Disposable coffee cups are often made from paper with a plastic lining.",
        claimType=ClaimType.verified_fact,
        confidence="high",
        sourceCount=2,
        support=ClaimSupport.direct,
    ),
    "claim-2": Claim(
        id="claim-2",
        text="Recycling rates for paper cups vary widely by municipality.",
        claimType=ClaimType.interpretation,
        confidence="medium",
        sourceCount=1,
        support=ClaimSupport.interpretation,
    ),
    "claim-3": Claim(
        id="claim-3",
        text="This style of cup is commonly used for takeaway coffee in North America.",
        claimType=ClaimType.synthesized_claim,
        confidence="high",
        sourceCount=1,
        support=ClaimSupport.inference,
    ),
    "claim-4": Claim(
        id="claim-4",
        text="U-Haul boxes are a common choice for DIY moving.",
        claimType=ClaimType.verified_fact,
        confidence="high",
        sourceCount=1,
        support=ClaimSupport.direct,
    ),
    "claim-5": Claim(
        id="claim-5",
        text="Cardboard moving boxes often end up in recycling or landfill.",
        claimType=ClaimType.interpretation,
        confidence="low",
        sourceCount=0,
        support=ClaimSupport.interpretation,
    ),
    "claim-6": Claim(
        id="claim-6",
        text="Paper cup liners complicate standard paper recycling streams.",
        claimType=ClaimType.verified_fact,
        confidence="high",
        sourceCount=2,
        support=ClaimSupport.direct,
    ),
}

# Sources (typed)
SOURCES = {
    "src-1": Source(
        id="src-1",
        type=SourceType.news,
        title="Paper cup recycling: what you need to know",
        publisher="Recycling Today",
        organizationId="org-recycling-today",
        contentHash="a1b2c3d4e5f6",
        retrievedAt="2024-01-15T12:00:00Z",
        excerpt="Most paper cups have a plastic lining that complicates recycling.",
    ),
    "src-2": Source(
        id="src-2",
        type=SourceType.gov,
        title="Municipal waste guidelines",
        publisher="EPA",
        organizationId="org-epa",
        contentHash="f6e5d4c3b2a1",
        retrievedAt="2024-01-10T09:00:00Z",
        excerpt="Recycling programs vary by jurisdiction; paper products are often separated.",
    ),
    "src-3": Source(
        id="src-3",
        type=SourceType.other,
        title="U-Haul packaging products",
        publisher="U-Haul",
        organizationId="org-uhaul",
        retrievedAt="2024-01-12T14:00:00Z",
        excerpt="Moving boxes and supplies for DIY moves.",
    ),
    "src-4": Source(
        id="src-4",
        type=SourceType.academic,
        title="Lifecycle of disposable food packaging",
        publisher="Journal of Industrial Ecology",
        organizationId="org-journal-industrial-ecology",
        contentHash="b2c3d4e5f6a1",
        retrievedAt="2024-01-08T10:00:00Z",
        excerpt="Paper cup liners prevent recycling in standard paper streams.",
    ),
}

# Verify-from-Media v1: fixture source/evidence for media claims with support_available
MEDIA_VERIFICATION_SOURCES: dict[str, Source] = {
    "src-media-1": Source(
        id="src-media-1",
        type=SourceType.news,
        title="Fixture source for media claim verification",
        publisher="Demo",
        contentHash="media1",
        retrievedAt="2024-06-01T12:00:00Z",
        excerpt="Fixture excerpt supporting the podcast episode summary claim.",
    ),
}
MEDIA_VERIFICATION_EVIDENCE: list[EvidenceSpan] = [
    EvidenceSpan(id="ev-media-1", claimId="mc-p1", sourceId="src-media-1", excerpt="Fixture excerpt supporting the podcast episode summary claim."),
]

# Evidence spans (claim -> source); link claims to supporting excerpts
EVIDENCE_SPANS = [
    EvidenceSpan(id="ev-1", claimId="claim-1", sourceId="src-1", excerpt="paper cups have a plastic lining"),
    EvidenceSpan(id="ev-2", claimId="claim-1", sourceId="src-2", excerpt="waste guidelines"),
    EvidenceSpan(id="ev-3", claimId="claim-2", sourceId="src-2", excerpt="municipal"),
    EvidenceSpan(id="ev-4", claimId="claim-3", sourceId="src-1", excerpt="takeaway"),
    EvidenceSpan(id="ev-5", claimId="claim-4", sourceId="src-3", excerpt="moving boxes"),
    EvidenceSpan(id="ev-6", claimId="claim-6", sourceId="src-1", excerpt="plastic lining that complicates recycling"),
    EvidenceSpan(id="ev-7", claimId="claim-6", sourceId="src-4", excerpt="Paper cup liners prevent recycling in standard paper streams"),
]

# Articles — canonical order: identification, summary, context blocks; then verify/trace entry, questions
ARTICLES = {
    "article-coffee": Article(
        id="article-coffee",
        nodeId="node-coffee-cup",
        title="Disposable coffee cup",
        nodeType=NodeType.product,
        blocks=[
            ArticleBlock(
                text="Disposable coffee cup. A common single-use product in food service.",
                blockType="identification",
            ),
            ArticleBlock(
                text="Paper with a plastic lining; recycling varies by region. Often used for takeaway coffee in North America.",
                blockType="summary",
                claimIds=["claim-1", "claim-3"],
            ),
            ArticleBlock(
                text="Disposable coffee cups are often made from paper with a plastic lining.",
                blockType="context",
                claimIds=["claim-1"],
            ),
            ArticleBlock(
                text="Recycling rates for paper cups vary widely by municipality. This style of cup is commonly used for takeaway coffee in North America.",
                blockType="context",
                claimIds=["claim-2", "claim-3"],
            ),
            ArticleBlock(
                text="Paper cup liners complicate standard paper recycling streams.",
                blockType="context",
                claimIds=["claim-6"],
            ),
        ],
        relatedNodeIds=["node-uhaul-box"],
        questionIds=["q1", "q2", "q3", "q4", "q5"],
    ),
    "article-uhaul": Article(
        id="article-uhaul",
        nodeId="node-uhaul-box",
        title="U-Haul moving box",
        nodeType=NodeType.product,
        blocks=[
            ArticleBlock(
                text="U-Haul moving box. A common choice for DIY and small moves.",
                blockType="identification",
            ),
            ArticleBlock(
                text="Cardboard moving box; widely recycled where facilities exist. End-of-life paths vary by municipality.",
                blockType="summary",
                claimIds=["claim-4"],
            ),
            ArticleBlock(
                text="U-Haul boxes are a common choice for DIY moving.",
                blockType="context",
                claimIds=["claim-4"],
            ),
            ArticleBlock(
                text="Cardboard moving boxes often end up in recycling or landfill. Limited verification for this result.",
                blockType="context",
                claimIds=["claim-5"],
            ),
        ],
        relatedNodeIds=["node-coffee-cup"],
        questionIds=["q6", "q7", "q8", "q9", "q10"],
    ),
    "article-poison-ivy": Article(
        id="article-poison-ivy",
        nodeId="node-poison-ivy",
        title="Poison ivy",
        nodeType=NodeType.other,
        blocks=[
            ArticleBlock(
                text="Poison ivy. A woody vine or shrub common in North America; leaves of three.",
                blockType="identification",
            ),
            ArticleBlock(
                text="Contact with oil from the plant can cause skin irritation in many people. Not medical advice; for general awareness only.",
                blockType="summary",
            ),
            ArticleBlock(
                text="Some people experience skin irritation from contact. Washing skin soon after contact may reduce reaction. See a healthcare provider if you have concerns.",
                blockType="context",
            ),
        ],
        relatedNodeIds=[],
        questionIds=[],
    ),
}

# Questions — article-specific where possible; feel like rabbit holes, not filler
QUESTIONS = {
    "q1": Question(id="q1", text="Where are paper cups typically recycled?", category="ecological"),
    "q2": Question(id="q2", text="What is the plastic lining made of?", category="scientific"),
    "q3": Question(id="q3", text="How do municipal policies differ?", category="institutional"),
    "q4": Question(id="q4", text="What alternatives exist for takeaway cups?", category="ecological"),
    "q5": Question(id="q5", text="Who regulates cup labeling?", category="legal"),
    "q6": Question(id="q6", text="How is cardboard from moving boxes recycled?", category="ecological"),
    "q7": Question(id="q7", text="What is the typical lifecycle of a moving box?", category="material"),
    "q8": Question(id="q8", text="How do recycling streams differ for corrugated vs. cup stock?", category="institutional"),
    "q9": Question(id="q9", text="What certifications apply to moving box materials?", category="legal"),
    "q10": Question(id="q10", text="Where does U-Haul source its cardboard?", category="supply"),
}

# Trace previews (shallow but real)
TRACES = {
    "node-coffee-cup": [
        TracePreview(
            path=[
                TraceNodeRef(nodeId="node-coffee-cup", name="Coffee cup"),
                TraceNodeRef(nodeId="node-pulp", name="Paper pulp"),
                TraceNodeRef(nodeId="node-forestry", name="Forestry"),
            ],
            traceType="material",
            label="Material trace: cup → paper pulp → forestry.",
        ),
    ],
    "node-uhaul-box": [
        TracePreview(
            path=[
                TraceNodeRef(nodeId="node-uhaul-box", name="U-Haul box"),
                TraceNodeRef(nodeId="node-cardboard", name="Cardboard"),
                TraceNodeRef(nodeId="node-recycling", name="Recycling stream"),
            ],
            traceType="material",
            label="Material trace: box → cardboard → recycling.",
        ),
    ],
}

# Stub nodes for trace path labels (path is in TracePreview; these are not returned by API)
STUB_NODES_FOR_TRACE = {
    "node-pulp": Node(id="node-pulp", name="Paper pulp", nodeType=NodeType.other),
    "node-forestry": Node(id="node-forestry", name="Forestry", nodeType=NodeType.place),
    "node-cardboard": Node(id="node-cardboard", name="Cardboard", nodeType=NodeType.product),
    "node-recycling": Node(id="node-recycling", name="Recycling stream", nodeType=NodeType.other),
}

# Experience layer: system path / lifecycle steps. relatedBlockIds = content-block indices as strings (0 = first after identification).
ARTICLE_EXPERIENCE = {
    "article-coffee": ArticleExperience(
        mode="system_path",
        steps=[
            ExperienceStep(id="ex-coffee-1", label="Paper shell", shortTitle="Material", description="Paper with plastic lining.", relatedBlockIds=["0", "1"], relatedClaimIds=["claim-1"], kind="stage"),
            ExperienceStep(id="ex-coffee-2", label="Plastic lining", shortTitle="Lining", description="Complicates recycling.", relatedBlockIds=["1", "3"], relatedClaimIds=["claim-1", "claim-6"], kind="stage"),
            ExperienceStep(id="ex-coffee-3", label="Beverage use", shortTitle="Use", description="Takeaway coffee in North America.", relatedBlockIds=["2"], relatedClaimIds=["claim-3"], kind="stage"),
            ExperienceStep(id="ex-coffee-4", label="Waste stream", shortTitle="Waste", description="Municipal variation.", relatedBlockIds=["2"], relatedClaimIds=["claim-2"], kind="handoff"),
            ExperienceStep(id="ex-coffee-5", label="Recycling failure point", shortTitle="Failure point", description="Liners prevent standard paper recycling.", relatedBlockIds=["3"], relatedClaimIds=["claim-6"], kind="failure_point"),
        ],
    ),
    "article-uhaul": ArticleExperience(
        mode="system_path",
        steps=[
            ExperienceStep(id="ex-uhaul-1", label="Material", shortTitle="Material", description="Cardboard moving box.", relatedBlockIds=["0", "1"], relatedClaimIds=["claim-4"], kind="stage"),
            ExperienceStep(id="ex-uhaul-2", label="Product use cycle", shortTitle="Use", description="DIY moving.", relatedBlockIds=["1"], relatedClaimIds=["claim-4"], kind="stage"),
            ExperienceStep(id="ex-uhaul-3", label="Repeated reuse", shortTitle="Reuse", description="Box reuse in practice.", relatedBlockIds=["1"], kind="stage"),
            ExperienceStep(id="ex-uhaul-4", label="Wear / maintenance", shortTitle="Wear", description="End-of-life handling.", relatedBlockIds=["2"], relatedClaimIds=["claim-5"], kind="handoff"),
            ExperienceStep(id="ex-uhaul-5", label="End-of-life handling", shortTitle="End-of-life", description="Recycling or landfill.", relatedBlockIds=["2"], relatedClaimIds=["claim-5"], kind="failure_point"),
        ],
    ),
}

# ----- Ecological Identification Groundwork v1 -----
# Fixture-backed ecological entities. Safety notes are general awareness only; no medical advice.
ECOLOGICAL_ENTITIES: dict[str, EcologicalEntity] = {
    "eco-poison-ivy": EcologicalEntity(
        id="eco-poison-ivy",
        name="Poison ivy",
        kind="plant",
        summary="Woody vine or shrub, leaves of three. Common in North America.",
        seasonalNotes=["Often more visible in spring and summer when leaves are out."],
        safetyNotes=[
            "General awareness: Some people experience skin irritation from contact with the plant's oil.",
            "Washing skin soon after contact may help reduce reaction. Not medical advice.",
        ],
        articleId="article-poison-ivy",
    ),
    "eco-tick": EcologicalEntity(
        id="eco-tick",
        name="Tick",
        kind="insect",
        summary="Small arachnid that may attach to skin. Various species in different regions.",
        seasonalNotes=["Ticks are often more active in warmer months in many regions."],
        safetyNotes=[
            "General awareness: Ticks can carry pathogens. If you find one attached, removal and follow-up guidance are available from health authorities.",
        ],
        articleId=None,
    ),
    "eco-oak": EcologicalEntity(
        id="eco-oak",
        name="Oak tree",
        kind="tree",
        summary="Deciduous or evergreen tree in the beech family. Many species across regions.",
        seasonalNotes=[],
        safetyNotes=[],
        articleId=None,
    ),
    "eco-bee": EcologicalEntity(
        id="eco-bee",
        name="Honey bee",
        kind="insect",
        summary="Social insect, important pollinator. Often recognized by striped abdomen.",
        seasonalNotes=["Active in warmer months when flowers are blooming."],
        safetyNotes=["General awareness: Bees can sting when disturbed. Some people are allergic."],
        articleId=None,
    ),
    "eco-mushroom": EcologicalEntity(
        id="eco-mushroom",
        name="Mushroom",
        kind="fungus",
        summary="Fruiting body of a fungus. Many species; identification requires care.",
        seasonalNotes=["Often appear after rain or in damp seasons."],
        safetyNotes=[
            "General awareness: Many wild mushrooms are not safe to eat. Do not consume without expert identification.",
        ],
        articleId=None,
    ),
}

# Segment id (from ecological regions) -> ecological entity id
SEGMENT_ID_TO_ECOLOGICAL_ENTITY_ID: dict[str, str] = {
    "seg-poison-ivy": "eco-poison-ivy",
    "seg-tick": "eco-tick",
    "seg-oak": "eco-oak",
    "seg-bee": "eco-bee",
    "seg-mushroom": "eco-mushroom",
}


def get_ecological_entity_for_segment(segment_id: str) -> EcologicalEntity | None:
    """Return ecological entity for this segment if it is an ecological fixture segment. Otherwise None."""
    entity_id = SEGMENT_ID_TO_ECOLOGICAL_ENTITY_ID.get(segment_id)
    if not entity_id:
        return None
    return ECOLOGICAL_ENTITIES.get(entity_id)


# Add material to NodeType if missing
def get_experience_for_article(article_id: str) -> ArticleExperience | None:
    return ARTICLE_EXPERIENCE.get(article_id)


def get_article_by_id(article_id: str) -> Article | None:
    return ARTICLES.get(article_id)


def get_article_by_node_id(node_id: str) -> Article | None:
    for a in ARTICLES.values():
        if a.nodeId == node_id:
            return a
    return None


def get_claim(claim_id: str) -> Claim | None:
    return CLAIMS.get(claim_id)


def get_source(source_id: str) -> Source | None:
    return SOURCES.get(source_id)


def get_sources_for_article(article_id: str) -> list[Source]:
    article = ARTICLES.get(article_id)
    if not article:
        return []
    source_ids = set()
    for block in article.blocks or []:
        for cid in block.claimIds or []:
            claim = CLAIMS.get(cid)
            if claim:
                for ev in EVIDENCE_SPANS:
                    if ev.claimId == cid:
                        source_ids.add(ev.sourceId)
    return [SOURCES[sid] for sid in source_ids if sid in SOURCES]


def get_questions_for_article(article_id: str) -> list[Question]:
    article = ARTICLES.get(article_id)
    if not article or not article.questionIds:
        return list(QUESTIONS.values())[:5]
    return [QUESTIONS[qid] for qid in article.questionIds if qid in QUESTIONS]


def get_traces_for_node(node_id: str) -> list[TracePreview]:
    return TRACES.get(node_id, [])


def get_verification_bundle(article_id: str) -> dict:
    """
    Build verification bundle for Verify surface: claims, sources, evidence spans, mappings.
    Makes claim/source/evidence relationships explicit for the UI.
    Claims are enriched with support and confidence (derived if missing).
    """
    from app.claim_epistemic import enrich_claim
    from app.verification_bundle import get_support_status

    article = ARTICLES.get(article_id)
    if not article:
        return {
            "claims": [],
            "sources": [],
            "evidenceSpans": [],
            "claimToSources": {},
            "claimToEvidence": {},
            "supportStatusByClaimId": {},
        }
    claim_ids = set()
    for block in article.blocks or []:
        for cid in block.claimIds or []:
            claim_ids.add(cid)
    claims = [CLAIMS[cid] for cid in claim_ids if cid in CLAIMS]
    source_ids = set()
    claim_to_sources: dict[str, list[str]] = {cid: [] for cid in claim_ids}
    claim_to_evidence: dict[str, list] = {cid: [] for cid in claim_ids}
    for ev in EVIDENCE_SPANS:
        if ev.claimId in claim_ids:
            source_ids.add(ev.sourceId)
            if ev.claimId not in claim_to_sources:
                claim_to_sources[ev.claimId] = []
            if ev.sourceId not in claim_to_sources[ev.claimId]:
                claim_to_sources[ev.claimId].append(ev.sourceId)
            claim_to_evidence[ev.claimId].append(ev.model_dump())
    sources = [SOURCES[sid] for sid in source_ids if sid in SOURCES]
    evidence_for_article = [ev for ev in EVIDENCE_SPANS if ev.claimId in claim_ids]
    support_status_by_claim: dict[str, str] = {}
    for c in claims:
        cnt = len(claim_to_sources.get(c.id, []))
        support_status_by_claim[c.id] = get_support_status(c, cnt)
    return {
        "claims": [enrich_claim(c) for c in claims],
        "sources": [s.model_dump() for s in sources],
        "evidenceSpans": [e.model_dump() for e in evidence_for_article],
        "claimToSources": claim_to_sources,
        "claimToEvidence": claim_to_evidence,
        "supportStatusByClaimId": support_status_by_claim,
    }


# Lens Surface v1: minimal keywords/aliases per article for search (no taxonomy).
SEARCH_KEYWORDS: dict[str, list[str]] = {
    "article-coffee": [
        "coffee", "coffee cup", "cup", "recycling", "paper cup", "disposable",
        "takeaway", "plastic lining", "paper",
    ],
    "article-uhaul": [
        "uhaul", "u-haul", "moving box", "moving blankets", "cardboard",
        "moving", "diy", "recycling", "landfill",
    ],
}


def _get_article_summary(article: Article) -> str:
    """First summary block text or empty."""
    for b in article.blocks or []:
        if getattr(b, "blockType", None) == "summary" and getattr(b, "text", None):
            return (b.text or "").strip()
    return ""


def search_articles(q: str) -> list[dict]:
    """
    Case-insensitive substring search over article title, node name, displayLabel,
    summary, and SEARCH_KEYWORDS. Returns list of SearchResult-shaped dicts.
    """
    if not q or not q.strip():
        return []
    needle = q.strip().lower()
    seen_article_ids: set[str] = set()
    results: list[dict] = []
    for article_id, article in ARTICLES.items():
        if article_id in seen_article_ids:
            continue
        node = NODES.get(article.nodeId) if article.nodeId else None
        title = (article.title or "").lower()
        node_name = (node.name or "").lower() if node else ""
        display_label = (node.displayLabel or "").lower() if node else ""
        summary = _get_article_summary(article).lower()
        keywords = [k.lower() for k in SEARCH_KEYWORDS.get(article_id, [])]
        match_reason: str | None = None
        if needle in title:
            match_reason = "title"
        elif node_name and needle in node_name:
            match_reason = "title"
        elif display_label and needle in display_label:
            match_reason = "alias"
        elif any(needle in kw or kw in needle for kw in keywords):
            match_reason = "keyword"
        elif summary and needle in summary:
            match_reason = "keyword"
        if match_reason is None:
            continue
        seen_article_ids.add(article_id)
        summary_text = _get_article_summary(article) or None
        image_url = getattr(node, "imageUrl", None) if node else None
        results.append({
            "nodeId": article.nodeId,
            "articleId": article.id,
            "title": article.title,
            "summary": summary_text,
            "imageUrl": image_url,
            "matchReason": match_reason,
        })
    return results


# Market Surface v1: fixture-backed market data per article. No live providers.
MEDICAL_WARNING = (
    "Information only — not medical advice. Talk to a licensed clinician or pharmacist before making treatment decisions."
)

ARTICLE_MARKET: dict[str, ArticleMarket] = {
    "article-coffee": ArticleMarket(
        title="Market",
        intro="Ways to act on what you learned about disposable coffee cups.",
        items=[
            MarketItem(
                id="m-coffee-1",
                title="Reusable cup options",
                subtitle="Better alternative",
                description="A better alternative to single-use: reusable cups or travel mugs.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="reusable coffee cup",
                tags=["reusable", "alternatives"],
            ),
            MarketItem(
                id="m-coffee-2",
                title="Safer-material cup alternatives",
                subtitle="Lower-risk materials",
                description="Explore cup and liner materials that are easier to recycle, compost, or lower-risk for heat and leaching.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="compostable coffee cup safer materials",
                tags=["materials", "alternatives", "safer"],
            ),
            MarketItem(
                id="m-coffee-3",
                title="Caffeine and health",
                subtitle="General information",
                description="General information about caffeine and beverage choices.",
                category=MarketCategory.medical_info,
                actionLabel="Learn more",
                destinationType="search",
                destinationValue="caffeine health",
                warning=MEDICAL_WARNING,
                tags=["health"],
            ),
            # Local Recommendations Layer v1: place-oriented search suggestions (fixture-backed).
            MarketItem(
                id="m-coffee-4",
                title="Healthier coffee or tea shop options",
                subtitle="Places to explore",
                description="Search for cafes or shops that offer healthier drink options.",
                category=MarketCategory.restaurants,
                actionLabel="Search",
                destinationType="search",
                destinationValue="healthier coffee shop tea shop options",
                tags=["local", "restaurants"],
            ),
            MarketItem(
                id="m-coffee-5",
                title="Reusable cup sellers",
                subtitle="Stores and options",
                description="Find where to buy reusable cups or travel mugs.",
                category=MarketCategory.shopping,
                actionLabel="Search",
                destinationType="search",
                destinationValue="reusable coffee cup travel mug sellers",
                tags=["local", "shopping"],
            ),
            MarketItem(
                id="m-coffee-6",
                title="Grocery alternatives for lower-sugar drinks",
                subtitle="Healthier choices",
                description="Search for lower-sugar beverage options at grocery level.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="grocery lower sugar drink alternatives",
                tags=["healthier", "grocery", "alternatives"],
            ),
            # Healthier Alternatives Layer v1: explicit "better alternative" options.
            MarketItem(
                id="m-coffee-8",
                title="Lower-waste coffee preparation",
                subtitle="Better alternative",
                description="Options for lower-waste brewing and prep instead of single-use pods or cups.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="lower waste coffee preparation reusable",
                tags=["alternatives", "lower-waste"],
            ),
            MarketItem(
                id="m-coffee-9",
                title="Unsweetened iced tea or lower-sugar bottled options",
                subtitle="Less processed",
                description="Better alternatives to sugary bottled coffee or energy drinks.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="unsweetened iced tea lower sugar bottled coffee alternatives",
                tags=["alternatives", "lower-sugar"],
            ),
            # Safer Products / Safer Vehicles Layer v1: lower-risk / safer-option actions.
            MarketItem(
                id="m-coffee-10",
                title="Lower-heat or lower-leaching cup materials",
                subtitle="Lower-risk option",
                description="Search for cup materials that may reduce heat transfer or leaching concerns.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="lower heat lower leaching coffee cup materials",
                tags=["safer", "materials"],
            ),
            MarketItem(
                id="m-coffee-11",
                title="Stainless or ceramic mug (durability and material safety)",
                subtitle="Safer material choice",
                description="Lower-risk reusable options: stainless steel or ceramic for durability and material safety.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="stainless steel ceramic coffee mug safer material",
                tags=["safer", "reusable"],
            ),
            MarketItem(
                id="m-coffee-7",
                title="Pharmacist and healthier food resources",
                subtitle="General resources only",
                description="High-level search for pharmacist consultation and healthier food options. Not medical advice.",
                category=MarketCategory.medical_info,
                actionLabel="Search",
                destinationType="search",
                destinationValue="pharmacist consultation healthier food options",
                warning=MEDICAL_WARNING,
                tags=["health", "resources"],
            ),
        ],
    ),
    "article-uhaul": ArticleMarket(
        title="Market",
        intro="Alternatives and next steps for moving and packing.",
        items=[
            MarketItem(
                id="m-uhaul-1",
                title="Moving blanket alternatives",
                subtitle="Reusable padding",
                description="A better alternative: reusable moving blankets and padding options.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="reusable moving blankets",
                tags=["reuse", "packing", "alternatives"],
            ),
            MarketItem(
                id="m-uhaul-2",
                title="Reusable packing goods",
                subtitle="Boxes and supplies",
                description="Better alternative to single-use boxes: reusable moving boxes and return programs.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="reusable moving boxes",
                tags=["reuse", "alternatives"],
            ),
            MarketItem(
                id="m-uhaul-3",
                title="Vehicle safety resources",
                subtitle="Safer transport",
                description="Resources for safer vehicle use and loading.",
                category=MarketCategory.vehicle_safety,
                actionLabel="Search",
                destinationType="search",
                destinationValue="vehicle safety loading",
                tags=["safety"],
            ),
            MarketItem(
                id="m-uhaul-4",
                title="Related: Disposable coffee cups",
                subtitle="Same supply-chain lens",
                description="Read how disposable cups and liners fit into materials and recycling.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Open article",
                destinationType="internal",
                destinationValue="article-coffee",
                tags=["related"],
            ),
            # Local Recommendations Layer v1: place-oriented search suggestions (fixture-backed).
            MarketItem(
                id="m-uhaul-5",
                title="Reusable packing supply stores",
                subtitle="Where to find options",
                description="Search for stores that carry reusable moving supplies.",
                category=MarketCategory.shopping,
                actionLabel="Search",
                destinationType="search",
                destinationValue="reusable packing supply stores moving",
                tags=["local", "packing"],
            ),
            MarketItem(
                id="m-uhaul-6",
                title="Moving supply stores and alternatives",
                subtitle="Alternatives to single-use",
                description="Find moving-supply alternatives and stores.",
                category=MarketCategory.shopping,
                actionLabel="Search",
                destinationType="search",
                destinationValue="moving supply stores alternatives reusable",
                tags=["local", "alternatives"],
            ),
            MarketItem(
                id="m-uhaul-7",
                title="Safer vehicle and transport options",
                subtitle="Resources and ratings",
                description="Search for safer vehicle use and family transport resources.",
                category=MarketCategory.vehicle_safety,
                actionLabel="Search",
                destinationType="search",
                destinationValue="safer used family vehicles transport",
                tags=["safety", "vehicle"],
            ),
            # Healthier Alternatives Layer v1: explicit "better alternative" options.
            MarketItem(
                id="m-uhaul-8",
                title="Reusable packing crates",
                subtitle="Better alternative to cardboard",
                description="Durable, reusable crates as a lower-waste alternative to single-use boxes.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="reusable packing crates moving",
                tags=["alternatives", "lower-waste"],
            ),
            MarketItem(
                id="m-uhaul-9",
                title="Recycled-content packing paper",
                subtitle="Lower-waste option",
                description="Packing paper with recycled content as a better alternative to virgin materials.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="recycled content packing paper moving",
                tags=["alternatives", "lower-waste"],
            ),
            MarketItem(
                id="m-uhaul-10",
                title="Durable long-life moving blankets",
                subtitle="Higher durability",
                description="Long-lasting moving blankets to reduce waste and repeated buys.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="durable reusable moving blankets long life",
                tags=["alternatives", "durability"],
            ),
            # Safer Products / Safer Vehicles Layer v1: lower-risk / safer-option actions.
            MarketItem(
                id="m-uhaul-11",
                title="Safer moving support and loading equipment",
                subtitle="Lower-risk transport",
                description="Search for safer moving support, straps, and loading equipment.",
                category=MarketCategory.vehicle_safety,
                actionLabel="Search",
                destinationType="search",
                destinationValue="safer moving support equipment loading straps",
                tags=["safer", "equipment"],
            ),
            MarketItem(
                id="m-uhaul-12",
                title="Lower-risk packing and cushioning materials",
                subtitle="Safer materials",
                description="Packing and cushioning options with lower-risk or safer material profiles.",
                category=MarketCategory.healthier_alternative,
                actionLabel="Search",
                destinationType="search",
                destinationValue="lower risk packing materials moving cushioning",
                tags=["safer", "alternatives"],
            ),
        ],
    ),
}


def get_article_market(article_id: str) -> ArticleMarket | None:
    """Return market data for an article, or None if none (do not show Market entry)."""
    return ARTICLE_MARKET.get(article_id)


# ----- Media Lens Groundwork v1: fixture-backed media URL resolution -----

# Map normalized_id or original URL -> { articleId?, title? }. Used by resolve_media.
MEDIA_REGISTRY: dict[str, dict[str, str]] = {
    # YouTube: one sample video ID -> article-coffee (deterministic demo)
    "dQw4w9WgXcQ": {"articleId": "article-coffee", "title": "Disposable coffee cup"},
    # Another YouTube ID -> article-uhaul
    "jNQXAC9IVRw": {"articleId": "article-uhaul", "title": "U-Haul moving box"},
    # Podcast: path-style id -> article-coffee
    "/podcast/episode/123": {"articleId": "article-coffee", "title": "Disposable coffee cup", "organizationId": "org-podcast-demo"},
    # TikTok/reel: no articleId = recognized but unmapped (placeholder)
    # Entries keyed by normalizedId or full URL can be added; lookup tries both.
}


def resolve_media(url: str) -> MediaReference | None:
    """
    If url is a recognized media URL, return MediaReference (with articleId if mapped).
    Otherwise return None (client should fall back to search).
    """
    from app.media_url import classify_media_url, normalize_media_id

    classified = classify_media_url(url)
    if not classified:
        return None
    kind, extracted_id = classified
    normalized_id = normalize_media_id(kind, url, extracted_id)
    # Look up by normalized_id first, then by original url
    entry = None
    if normalized_id:
        entry = MEDIA_REGISTRY.get(normalized_id)
    if not entry:
        entry = MEDIA_REGISTRY.get(url.strip())
    article_id = entry.get("articleId") if entry else None
    title = entry.get("title") if entry else None
    org_id = entry.get("organizationId") if entry else None
    return MediaReference(
        kind=kind,
        originalUrl=url.strip(),
        normalizedId=normalized_id,
        title=title,
        articleId=article_id,
        organizationId=org_id,
    )


# ----- Media Transcript / Summary Ingestion Groundwork v1 -----

# Keyed by normalized_id or original URL. Each value: summaryBlocks, transcriptBlocks (fixture lists).
MEDIA_INTERPRETATIONS: dict[str, dict] = {
    "dQw4w9WgXcQ": {
        "summaryBlocks": [
            MediaSummaryBlock(id="ms-y1", title="Overview", content="A short fixture summary for this YouTube sample. It explains the main idea in one paragraph."),
            MediaSummaryBlock(id="ms-y2", title="Key takeaway", content="The key takeaway is that this is deterministic fixture content for Media Lens v1."),
        ],
        "transcriptBlocks": [
            MediaTranscriptBlock(id="mt-y1", speaker=None, content="First line of fixture transcript.", startMs=0),
            MediaTranscriptBlock(id="mt-y2", speaker="Host", content="Second line with a speaker label.", startMs=5000),
            MediaTranscriptBlock(id="mt-y3", speaker=None, content="Third line without speaker.", startMs=12000),
        ],
        "claims": [
            Claim(
                id="mc-y1",
                text="The content presents a main idea that is summarized in the fixture.",
                claimType=ClaimType.interpretation,
                confidence=ConfidenceLevel.medium,
                sourceCount=0,
                support=ClaimSupport.interpretation,
            ),
            Claim(
                id="mc-y2",
                text="This is deterministic demo content, not independently verified.",
                claimType=ClaimType.interpretation,
                confidence=ConfidenceLevel.low,
                sourceCount=0,
                support=ClaimSupport.interpretation,
            ),
        ],
        "supportStatusByClaimId": {"mc-y1": "interpretation_only", "mc-y2": "no_support_yet"},
    },
    "jNQXAC9IVRw": {
        "summaryBlocks": [
            MediaSummaryBlock(id="ms-y2-1", title="Summary", content="Fixture summary for the second YouTube example (U-Haul article)."),
        ],
        "transcriptBlocks": [
            MediaTranscriptBlock(id="mt-y2-1", content="Excerpt from the fixture transcript.", startMs=0),
        ],
        "claims": [
            Claim(
                id="mc-y2-1",
                text="The excerpt is fixture-backed; no claim is independently verified.",
                claimType=ClaimType.interpretation,
                confidence=ConfidenceLevel.low,
                sourceCount=0,
                support=ClaimSupport.interpretation,
            ),
        ],
        "supportStatusByClaimId": {"mc-y2-1": "no_support_yet"},
    },
    "/podcast/episode/123": {
        "summaryBlocks": [
            MediaSummaryBlock(id="ms-p1", title="Episode summary", content="This podcast episode is fixture-backed for media interpretation groundwork."),
        ],
        "transcriptBlocks": [
            MediaTranscriptBlock(id="mt-p1", speaker="Host", content="Welcome to the episode.", startMs=0),
            MediaTranscriptBlock(id="mt-p2", speaker="Guest", content="Thanks for having me.", startMs=8000),
        ],
        "claims": [
            Claim(
                id="mc-p1",
                text="The episode summary is derived from fixture content, not from a real transcript.",
                claimType=ClaimType.synthesized_claim,
                confidence=ConfidenceLevel.medium,
                sourceCount=0,
                support=ClaimSupport.interpretation,
            ),
        ],
        "supportStatusByClaimId": {"mc-p1": "support_available"},
    },
    "/podcast/episode/456": {
        "summaryBlocks": [
            MediaSummaryBlock(id="ms-p2", title="Summary", content="Another fixture episode with no claims for testing."),
        ],
        "transcriptBlocks": [
            MediaTranscriptBlock(id="mt-p2-1", content="Fixture transcript only.", startMs=0),
        ],
    },
}


def get_media_interpretation(url: str) -> MediaInterpretation | None:
    """Return interpretation (summary + transcript) for a media URL, or None if not available."""
    ref = resolve_media(url)
    if not ref:
        return None
    entry = (MEDIA_INTERPRETATIONS.get(ref.normalizedId) if ref.normalizedId else None) or MEDIA_INTERPRETATIONS.get(url.strip())
    if not entry:
        return None
    return MediaInterpretation(
        ref=ref,
        summaryBlocks=entry.get("summaryBlocks"),
        transcriptBlocks=entry.get("transcriptBlocks"),
        claims=entry.get("claims"),
        supportStatusByClaimId=entry.get("supportStatusByClaimId"),
    )


# ----- Verify-from-Media v1: verification bundle per media (fixture-backed) -----

MEDIA_VERIFICATION: dict[str, dict] = {
    "/podcast/episode/123": {
        "supportStatusByClaimId": {"mc-p1": "support_available"},
        "sourceIds": ["src-media-1"],
        "evidenceSpans": MEDIA_VERIFICATION_EVIDENCE,
        "claimToSources": {"mc-p1": ["src-media-1"]},
        "claimToEvidence": {"mc-p1": [MEDIA_VERIFICATION_EVIDENCE[0]]},
    },
    "dQw4w9WgXcQ": {"supportStatusByClaimId": {"mc-y1": "interpretation_only", "mc-y2": "no_support_yet"}},
    "jNQXAC9IVRw": {"supportStatusByClaimId": {"mc-y2-1": "no_support_yet"}},
}


def get_media_verification_bundle(url: str) -> dict | None:
    """
    Build verification bundle for media URL: claims from interpretation + support status + optional sources/evidence.
    Returns None if URL is not media or has no interpretation. Same shape as article VerificationResponse.
    """
    interp = get_media_interpretation(url)
    if not interp or not interp.claims:
        return None
    ref = interp.ref
    normalized_id = ref.normalizedId or url.strip()
    ver = MEDIA_VERIFICATION.get(normalized_id) or MEDIA_VERIFICATION.get(url.strip())
    support_status = ver.get("supportStatusByClaimId", {}) if ver else {}
    # Default any claim without status to interpretation_only
    for c in interp.claims:
        if c.id not in support_status:
            support_status = {**support_status, c.id: "interpretation_only"}

    source_ids = set()
    claim_to_sources: dict[str, list[str]] = {}
    claim_to_evidence: dict[str, list] = {}
    evidence_spans: list = []
    sources: list = []

    if ver and ver.get("sourceIds"):
        for sid in ver["sourceIds"]:
            if sid in MEDIA_VERIFICATION_SOURCES:
                source_ids.add(sid)
                sources.append(MEDIA_VERIFICATION_SOURCES[sid])
        for cid, sids in ver.get("claimToSources", {}).items():
            claim_to_sources[cid] = list(sids)
        for cid, spans in ver.get("claimToEvidence", {}).items():
            span_dicts = [s.model_dump() if hasattr(s, "model_dump") else s for s in spans]
            claim_to_evidence[cid] = span_dicts
            evidence_spans.extend(span_dicts)

    return {
        "claims": [c.model_dump() for c in interp.claims],
        "sources": [s.model_dump() for s in sources],
        "evidenceSpans": evidence_spans,
        "claimToSources": claim_to_sources,
        "claimToEvidence": claim_to_evidence,
        "supportStatusByClaimId": support_status,
    }


# ----- Organization/Company Profile v1: fixture-backed profiles -----

# Organization-to-Claim/Source Cross-Linking v1: which sources to show as "Related sources" per org.
ORG_RELATED_SOURCE_IDS: dict[str, list[str]] = {
    "org-recycling-today": ["src-1"],
    "org-epa": ["src-2"],
    "org-uhaul": ["src-3"],
    "org-journal-industrial-ecology": ["src-4"],
}

# Organization-to-Claim/Source Cross-Linking v1: which claims to show as "Related claims" per org (e.g. cited by org sources; not endorsement).
ORG_RELATED_CLAIM_IDS: dict[str, list[str]] = {
    "org-recycling-today": ["claim-1", "claim-3", "claim-6"],
    "org-epa": ["claim-2"],
    "org-uhaul": ["claim-4"],
    "org-journal-industrial-ecology": [],  # optional: could add claim-6 which has evidence from src-4
}

ORGANIZATION_PROFILES: dict[str, OrganizationProfile] = {
    "org-recycling-today": OrganizationProfile(
        id="org-recycling-today",
        name="Recycling Today",
        kind=OrganizationKind.publisher,
        summary="Trade publication covering recycling and waste management.",
        description="Recycling Today is a business and trade media brand focused on recycling, waste, and sustainability industries.",
        notableProducts=["Recycling Today (magazine)", "digital coverage"],
        relatedTopics=["recycling", "waste management", "sustainability"],
        linkedItems=[
            OrganizationLinkedItem(
                id="li-rt-mag",
                name="Recycling Today (magazine)",
                kind=OrganizationLinkedItemKind.media_property,
                summary="Trade publication.",
            ),
        ],
    ),
    "org-epa": OrganizationProfile(
        id="org-epa",
        name="U.S. Environmental Protection Agency",
        kind=OrganizationKind.regulator,
        summary="Federal agency responsible for environmental protection and human health.",
        description="The EPA develops and enforces regulations, funds research, and provides guidance on environmental and public health matters.",
        notableProducts=["Municipal waste guidelines", "recycling program guidance"],
        relatedTopics=["recycling", "waste", "environment", "regulation"],
    ),
    "org-uhaul": OrganizationProfile(
        id="org-uhaul",
        name="U-Haul",
        kind=OrganizationKind.company,
        summary="Moving and storage company known for truck and trailer rentals and packaging supplies.",
        description="U-Haul provides DIY moving equipment, storage, and packaging products across North America.",
        notableProducts=["Moving trucks", "trailers", "boxes", "moving blankets"],
        relatedTopics=["moving", "storage", "packaging", "recycling"],
        linkedItems=[
            OrganizationLinkedItem(
                id="li-uhaul-box",
                name="U-Haul moving box",
                kind=OrganizationLinkedItemKind.product,
                summary="Cardboard moving box for DIY moves.",
                articleId="article-uhaul",
            ),
            OrganizationLinkedItem(
                id="li-uhaul-trucks",
                name="Moving trucks & trailers",
                kind=OrganizationLinkedItemKind.service,
                summary="Truck and trailer rentals.",
            ),
        ],
    ),
    "org-journal-industrial-ecology": OrganizationProfile(
        id="org-journal-industrial-ecology",
        name="Journal of Industrial Ecology",
        kind=OrganizationKind.publisher,
        summary="Peer-reviewed academic journal on industrial ecology and sustainability.",
        description="The journal publishes research on the relationship between industry and the environment, including lifecycle assessment and circular economy.",
        notableProducts=["Journal of Industrial Ecology"],
        relatedTopics=["industrial ecology", "lifecycle", "sustainability", "academic research"],
    ),
    "org-podcast-demo": OrganizationProfile(
        id="org-podcast-demo",
        name="Demo Podcast Network",
        kind=OrganizationKind.network,
        summary="Fixture podcast network for media lens demos.",
        description="A placeholder organization representing the publisher or network behind a podcast in fixture data.",
        relatedTopics=["podcast", "media"],
        linkedItems=[
            OrganizationLinkedItem(
                id="li-podcast-ep",
                name="Disposable coffee cup episode",
                kind=OrganizationLinkedItemKind.media_property,
                summary="Fixture podcast episode.",
                articleId="article-coffee",
            ),
        ],
    ),
    "org-pharma-demo": OrganizationProfile(
        id="org-pharma-demo",
        name="Example Pharma (fixture)",
        kind=OrganizationKind.pharma,
        summary="Fixture pharma organization for org-to-product linking demos.",
        description="Context only; not a real company. Used to demonstrate medication-style linked items.",
        relatedTopics=["medication", "context"],
        linkedItems=[
            OrganizationLinkedItem(
                id="li-med-context",
                name="Example medication (context only)",
                kind=OrganizationLinkedItemKind.medication,
                summary="Organizational context only; not medical advice or recommendation.",
            ),
        ],
    ),
}


def get_organization_profile(org_id: str) -> OrganizationProfile | None:
    """Return organization profile by id, or None if not found. Does not include relatedSources/relatedClaims; enrich in route."""
    return ORGANIZATION_PROFILES.get(org_id)


def get_related_sources_for_org(org_id: str) -> list[OrganizationRelatedSource]:
    """Organization-to-Claim/Source Cross-Linking v1: return compact related sources for org (fixture-backed)."""
    source_ids = ORG_RELATED_SOURCE_IDS.get(org_id) or []
    out: list[OrganizationRelatedSource] = []
    for sid in source_ids:
        s = SOURCES.get(sid)
        if s:
            out.append(OrganizationRelatedSource(id=s.id, title=s.title))
    return out


def get_related_claims_for_org(org_id: str) -> list[OrganizationRelatedClaim]:
    """Organization-to-Claim/Source Cross-Linking v1: return compact related claims for org (fixture-backed). Neutral: not endorsement."""
    claim_ids = ORG_RELATED_CLAIM_IDS.get(org_id) or []
    out: list[OrganizationRelatedClaim] = []
    for cid in claim_ids:
        c = CLAIMS.get(cid)
        if c:
            conf = str(c.confidence) if c.confidence else None
            out.append(OrganizationRelatedClaim(id=c.id, text=c.text, confidence=conf))
    return out


# ----- Audio Recognition Groundwork v1: fixture-backed clipId/uri -> result -----

AUDIO_RECOGNITION_FIXTURES: dict[str, dict] = {
    "sample-song": {
        "kind": "song",
        "title": "Sample song (fixture)",
        "subtitle": "Fixture-backed; no real fingerprinting",
        "articleId": "article-coffee",
        "confidence": "high",
    },
    "sample-podcast": {
        "kind": "podcast",
        "title": "Recycling Today Podcast (fixture)",
        "subtitle": "Episode clip",
        "mediaUrl": "https://example.com/podcast/episode/123",
        "organizationId": "org-podcast-demo",
        "confidence": "medium",
    },
    "sample-show-theme": {
        "kind": "show_theme",
        "title": "Sample show theme (fixture)",
        "subtitle": "TV theme stub",
        "articleId": "article-uhaul",
        "confidence": "high",
        "networkOrPlatform": "Demo Network",
        "notableCast": ["Fixture Actor A"],
    },
    "sample-tv-show": {
        "kind": "tv_show",
        "title": "Moving Day (fixture)",
        "subtitle": "Reality series about moving and logistics",
        "articleId": "article-uhaul",
        "organizationId": "org-uhaul",
        "confidence": "high",
        "networkOrPlatform": "Demo Network",
        "notableCast": ["Host One", "Host Two"],
    },
    "sample-org-only": {
        "kind": "media_clip",
        "title": "Org profile clip (fixture)",
        "subtitle": "Routes to organization only",
        "organizationId": "org-uhaul",
        "confidence": "medium",
    },
}


def recognize_audio_clip(clip_id_or_uri: str) -> dict | None:
    """Return fixture-backed AudioRecognitionResult dict for known clipId/uri, else None. No real fingerprinting."""
    s = (clip_id_or_uri or "").strip()
    if not s:
        return None
    # Real microphone capture v1: recorded clips send placeholder token; no fingerprinting so no match.
    if s == "recorded" or s.startswith("recorded://") or s.startswith("file://"):
        return None
    # Direct key
    if s in AUDIO_RECOGNITION_FIXTURES:
        return dict(AUDIO_RECOGNITION_FIXTURES[s])
    # Stub URI form: stub://audio/<clipId> or file:///.../sample-song
    if s.startswith("stub://audio/"):
        key = s.replace("stub://audio/", "").strip()
        return dict(AUDIO_RECOGNITION_FIXTURES[key]) if key in AUDIO_RECOGNITION_FIXTURES else None
    if "sample-song" in s or s.endswith("/sample-song"):
        return dict(AUDIO_RECOGNITION_FIXTURES["sample-song"])
    if "sample-podcast" in s or s.endswith("/sample-podcast"):
        return dict(AUDIO_RECOGNITION_FIXTURES["sample-podcast"])
    if "sample-show-theme" in s or s.endswith("/sample-show-theme"):
        return dict(AUDIO_RECOGNITION_FIXTURES["sample-show-theme"])
    if "sample-tv-show" in s or s.endswith("/sample-tv-show"):
        return dict(AUDIO_RECOGNITION_FIXTURES["sample-tv-show"])
    if "sample-org-only" in s or s.endswith("/sample-org-only"):
        return dict(AUDIO_RECOGNITION_FIXTURES["sample-org-only"])
    return None


# ----- Page-to-Study Groundwork v1: fixture-authored study guides per article -----

ARTICLE_STUDY_GUIDES: dict[str, ArticleStudyGuide] = {
    "article-coffee": ArticleStudyGuide(
        title="Study: Disposable coffee cup",
        intro="A short study guide grounded in this article. Use it to understand the basics and common confusions.",
        blocks=[
            StudyBlock(
                id="sb-coffee-1",
                kind="overview",
                title="What this is about",
                content="This article is about disposable coffee cups: how they’re made (paper with a plastic lining), how they’re used (takeaway coffee), and what happens to them after use. Recycling varies by municipality; the lining complicates standard paper recycling.",
            ),
            StudyBlock(
                id="sb-coffee-2",
                kind="explain_simple",
                title="Explain simply",
                content="A disposable coffee cup is usually paper on the outside with a thin plastic layer inside so it doesn’t leak. That combo makes it hard to recycle like normal paper, and rules differ from place to place.",
            ),
            StudyBlock(
                id="sb-coffee-3",
                kind="key_points",
                title="Key points to remember",
                content="",
                bulletItems=[
                    "Paper shell with plastic lining; common for takeaway coffee.",
                    "Recycling rates for paper cups vary widely by municipality.",
                    "Liners complicate standard paper recycling streams.",
                    "Interpretations about end-of-life vary; the article notes regional differences.",
                ],
            ),
            StudyBlock(
                id="sb-coffee-4",
                kind="why_it_matters",
                title="Why it matters",
                content="Single-use cups affect waste streams and recycling infrastructure. Understanding material and policy variation helps you interpret claims about “recyclable” or “compostable” cups.",
            ),
            StudyBlock(
                id="sb-coffee-5",
                kind="common_confusion",
                title="Common confusion",
                content="People often assume paper cups are recycled like office paper. In many systems they aren’t, because of the plastic lining. The article does not claim a single global fact; it reflects variation and interpretation.",
            ),
            StudyBlock(
                id="sb-coffee-6",
                kind="study_questions",
                title="Study questions",
                content="Questions this article raises (good for checking understanding):",
                bulletItems=[
                    "Where are paper cups typically recycled?",
                    "What is the plastic lining made of?",
                    "How do municipal policies differ?",
                    "What alternatives exist for takeaway cups?",
                    "Who regulates cup labeling?",
                ],
            ),
        ],
    ),
    "article-uhaul": ArticleStudyGuide(
        title="Study: U-Haul moving box",
        intro="A short study guide grounded in this article. Use it to lock in the main ideas and edge cases.",
        blocks=[
            StudyBlock(
                id="sb-uhaul-1",
                kind="overview",
                title="What this is about",
                content="This article is about U-Haul moving boxes: a common cardboard product for DIY moving. It covers typical use, reuse in practice, and end-of-life (recycling or landfill), with the caveat that verification is limited and outcomes vary by municipality.",
            ),
            StudyBlock(
                id="sb-uhaul-2",
                kind="explain_simple",
                title="Explain simply",
                content="U-Haul moving boxes are cardboard boxes used for packing and moving. They’re widely used and often recycled where facilities exist, but where they end up—recycling vs. landfill—depends on local systems.",
            ),
            StudyBlock(
                id="sb-uhaul-3",
                kind="key_points",
                title="Key points to remember",
                content="",
                bulletItems=[
                    "U-Haul boxes are a common choice for DIY moving.",
                    "Cardboard is widely recycled where facilities exist.",
                    "End-of-life paths vary by municipality.",
                    "The article notes limited verification for some claims.",
                ],
            ),
            StudyBlock(
                id="sb-uhaul-4",
                kind="why_it_matters",
                title="Why it matters",
                content="Moving generates a lot of cardboard. Knowing that reuse and recycling depend on local infrastructure helps you interpret “green” or “recyclable” claims and make better disposal choices.",
            ),
            StudyBlock(
                id="sb-uhaul-5",
                kind="common_confusion",
                title="Common confusion",
                content="“Cardboard is recyclable” is often true in principle, but in practice not all programs accept all cardboard, and condition (e.g. tape, wear) can matter. The article treats end-of-life as variable and partly interpretive.",
            ),
            StudyBlock(
                id="sb-uhaul-6",
                kind="study_questions",
                title="Study questions",
                content="Questions this article raises:",
                bulletItems=[
                    "How is cardboard from moving boxes recycled?",
                    "What is the typical lifecycle of a moving box?",
                    "How do recycling streams differ for corrugated vs. cup stock?",
                    "What certifications apply to moving box materials?",
                    "Where does U-Haul source its cardboard?",
                ],
            ),
        ],
    ),
}


def get_article_study(article_id: str) -> ArticleStudyGuide | None:
    """Return study guide for an article, or None (do not show Study entry)."""
    return ARTICLE_STUDY_GUIDES.get(article_id)
