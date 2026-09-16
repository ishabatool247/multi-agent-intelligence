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
        temperature=0.4,
    )


def generate_followups(
    prospect_name,
    company_name,
    product,
    research_report,
    first_email,
):

    llm = get_llm()

    prompt = f"""
You are an expert B2B sales follow-up strategist.

Create a professional follow-up sequence for this prospect.

PROSPECT:
{prospect_name}

COMPANY:
{company_name}

PRODUCT/SERVICE:
{product}

RESEARCH:
{research_report}

FIRST EMAIL:
{first_email}

Create 3 follow-up messages.

Follow-up 1:
Send approximately 2-3 days after the first email.

Follow-up 2:
Send approximately 5-7 days after the first email.

Follow-up 3:
Send approximately 10-14 days after the first email.

Requirements:

- Each follow-up should be different.
- Keep each message concise.
- Maintain a professional and friendly tone.
- Reference the prospect/company naturally.
- Focus on value rather than pressure.
- Include a simple call to action.
- Do not invent facts.
- Do not use excessive emojis.

Use this format:

## Follow-Up 1 — 2-3 Days

Subject: [subject]

Hi {prospect_name},

[message]

---

## Follow-Up 2 — 5-7 Days

Subject: [subject]

Hi {prospect_name},

[message]

---

## Follow-Up 3 — 10-14 Days

Subject: [subject]

Hi {prospect_name},

[message]
"""

    response = llm.invoke(prompt)

    return response.content