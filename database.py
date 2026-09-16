import sqlite3
from datetime import datetime


# ============================================================
# DATABASE CONFIG
# ============================================================

DATABASE_NAME = "sales_agent.db"


# ============================================================
# CREATE DATABASE
# ============================================================

def create_database():

    conn = sqlite3.connect(DATABASE_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prospect_name TEXT NOT NULL,
            company_name TEXT NOT NULL,
            company_website TEXT,
            product TEXT NOT NULL,
            industry TEXT NOT NULL,
            research_report TEXT,
            first_email TEXT,
            followups TEXT,
            lead_score TEXT,
            created_at TEXT
        )
        """
    )

    conn.commit()
    conn.close()


# ============================================================
# SAVE LEAD
# ============================================================

def save_lead(
    prospect_name,
    company_name,
    company_website,
    product,
    industry,
    research_report,
    first_email,
    followups,
    lead_score,
):

    conn = sqlite3.connect(DATABASE_NAME)

    cursor = conn.cursor()

    created_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    cursor.execute(
        """
        INSERT INTO leads (
            prospect_name,
            company_name,
            company_website,
            product,
            industry,
            research_report,
            first_email,
            followups,
            lead_score,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            prospect_name,
            company_name,
            company_website,
            product,
            industry,
            research_report,
            first_email,
            followups,
            lead_score,
            created_at,
        ),
    )

    conn.commit()
    conn.close()


# ============================================================
# GET LEADS
# ============================================================

def get_leads():

    conn = sqlite3.connect(DATABASE_NAME)

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            prospect_name,
            company_name,
            company_website,
            product,
            industry,
            research_report,
            first_email,
            followups,
            lead_score,
            created_at
        FROM leads
        ORDER BY id DESC
        """
    )

    leads = cursor.fetchall()

    conn.close()

    return leads