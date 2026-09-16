import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()


def get_llm():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            "GROQ_API_KEY is missing. Please check your .env file."
        )

    return ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=api_key,
        temperature=0.1,
    )


def score_lead(
    prospect_name,
    company_name,
    product,
    target_industry,
    research_report,
):

    llm = get_llm()

    prompt = f"""
You are an expert B2B sales qualification agent.

Evaluate this sales lead.

PROSPECT:
{prospect_name}

COMPANY:
{company_name}

PRODUCT/SERVICE:
{product}

TARGET INDUSTRY:
{target_industry}

RESEARCH:
{research_report}

Give the lead a score from 1 to 10.

Use these factors:

1. Business fit
2. Industry fit
3. Potential need
4. Sales opportunity
5. Personalization potential

Scoring guide:

1-3 = Low quality
4-6 = Medium quality
7-10 = High quality

Return the result using EXACTLY this structure:

LEAD SCORE: X/10

LEAD QUALITY: High

REASONING:
[Explain the score.]

BUSINESS FIT:
[Explain.]

INDUSTRY FIT:
[Explain.]

POTENTIAL NEED:
[Explain.]

SALES OPPORTUNITY:
[Explain.]

RECOMMENDED ACTION:
[Explain what the salesperson should do next.]

Important:
- Replace X with a number from 1 to 10.
- LEAD QUALITY must be exactly Low, Medium, or High.
- Do not invent facts.
- Base the assessment on the provided research.
"""

    response = llm.invoke(prompt)

    return response.content