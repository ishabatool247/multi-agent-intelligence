import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()


def get_llm():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            "GROQ_API_KEY is missing. Please add your Groq API key to the .env file."
        )

    return ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=api_key,
        temperature=0.2,
    )


def research_prospect(
    prospect_name,
    company_name,
    company_website,
    product,
    target_industry,
):

    llm = get_llm()

    prompt = f"""
You are an expert B2B sales research agent.

Analyze the following prospect for a sales team.

PROSPECT:
{prospect_name}

COMPANY:
{company_name}

WEBSITE:
{company_website or "Not provided"}

PRODUCT/SERVICE:
{product}

TARGET INDUSTRY:
{target_industry}

Create a professional sales research report.

Use these sections:

## Company Overview

## Prospect Analysis

## Business Needs

## Potential Pain Points

## Sales Opportunities

## Personalization Insights

## Recommended Sales Approach

Important instructions:

- Do not invent specific facts.
- Clearly identify assumptions.
- Keep the analysis practical.
- Focus on potential business value.
- Make the report useful for writing a sales email.
"""

    response = llm.invoke(prompt)

    return response.content