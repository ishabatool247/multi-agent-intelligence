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


def generate_email(
    prospect_name,
    company_name,
    product,
    research_report,
):

    llm = get_llm()

    prompt = f"""
You are an expert B2B sales copywriter.

Write a highly personalized professional sales email.

PROSPECT:
{prospect_name}

COMPANY:
{company_name}

PRODUCT/SERVICE:
{product}

RESEARCH:
{research_report}

Requirements:

- Address the prospect by name.
- Mention the company naturally.
- Use relevant insights from the research.
- Explain how the product/service could provide value.
- Keep the email concise.
- Do not make unsupported claims.
- Do not sound like spam.
- Use a professional but human tone.
- Include a clear call to action.
- Do not use excessive emojis.

Format:

Subject: [short personalized subject]

Dear {prospect_name},

[Email body]

Best regards,
[Your Name]
"""

    response = llm.invoke(prompt)

    return response.content