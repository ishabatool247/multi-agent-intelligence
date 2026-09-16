import streamlit as st
import pandas as pd
import plotly.express as px

# =========================================================
# PAGE CONFIG
# =========================================================
st.set_page_config(
    page_title="NexaAI | Multi-Agent Sales",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =========================================================
# CUSTOM CSS
# =========================================================
st.markdown("""
<style>

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

* {
    font-family: 'DM Sans', sans-serif;
}

.stApp {
    background: #f7f8fc;
}

.block-container {
    padding: 25px 35px 50px;
    max-width: 1500px;
}

/* SIDEBAR */

[data-testid="stSidebar"] {
    background: #111827;
}

[data-testid="stSidebar"] * {
    color: #d1d5db;
}

.logo {
    font-family: 'Space Grotesk';
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
}

.logo span {
    color: #8b5cf6;
}

.tagline {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 30px;
}

.menu-title {
    font-size: 10px;
    letter-spacing: 1.5px;
    color: #64748b;
    margin-top: 25px;
    margin-bottom: 8px;
}

/* HERO */

.hero {
    padding: 32px;
    border-radius: 24px;
    background:
        radial-gradient(circle at 85% 20%, #6d28d9 0%, transparent 25%),
        linear-gradient(135deg, #111827, #312e81);
    color: white;
    margin-bottom: 25px;
    position: relative;
    overflow: hidden;
}

.hero-small {
    color: #c4b5fd;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.hero h1 {
    font-family: 'Space Grotesk';
    font-size: 36px;
    margin: 7px 0;
}

.hero p {
    color: #cbd5e1;
    max-width: 650px;
}

/* KPI */

.kpi {
    background: white;
    padding: 20px;
    border-radius: 18px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 5px 20px rgba(15,23,42,.04);
}

.kpi-title {
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
}

.kpi-number {
    font-family: 'Space Grotesk';
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-top: 5px;
}

.kpi-growth {
    color: #16a34a;
    font-size: 11px;
    margin-top: 3px;
}

/* AGENT CARDS */

.agent-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 20px;
    height: 155px;
    box-shadow: 0 5px 20px rgba(15,23,42,.035);
}

.agent-icon {
    width: 42px;
    height: 42px;
    border-radius: 13px;
    background: #f1edff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    margin-bottom: 12px;
}

.agent-name {
    font-weight: 700;
    color: #111827;
}

.agent-desc {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
}

.online {
    color: #16a34a;
    font-size: 10px;
    margin-top: 10px;
}

/* PANELS */

.panel {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 5px 20px rgba(15,23,42,.035);
}

.panel-title {
    font-family: 'Space Grotesk';
    font-size: 18px;
    font-weight: 700;
    color: #111827;
}

.panel-sub {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 15px;
}

/* LEADS */

.lead-row {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eef0f4;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #ede9fe;
    color: #6d28d9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    margin-right: 12px;
}

.lead-name {
    font-size: 13px;
    font-weight: 700;
}

.company {
    font-size: 11px;
    color: #94a3b8;
}

.score {
    margin-left: auto;
    padding: 5px 10px;
    background: #ecfdf5;
    color: #15803d;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 700;
}

/* BUTTON */

.stButton > button {
    border-radius: 11px;
    font-weight: 600;
    min-height: 42px;
}

</style>
""", unsafe_allow_html=True)


# =========================================================
# SIDEBAR
# =========================================================

with st.sidebar:

    st.markdown(
        '<div class="logo">Nexa<span>AI</span> ✦</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="tagline">MULTI-AGENT SALES INTELLIGENCE</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="menu-title">MAIN MENU</div>',
        unsafe_allow_html=True
    )

    page = st.radio(
        "Navigation",
        [
            "Dashboard",
            "Leads",
            "AI Research",
            "Email Studio",
            "Follow-ups",
            "Analytics"
        ],
        label_visibility="collapsed"
    )

    st.markdown(
        '<div class="menu-title">AI AGENTS</div>',
        unsafe_allow_html=True
    )

    st.markdown("🟢 Research Agent")
    st.markdown("🟢 Lead Scoring Agent")
    st.markdown("🟢 Email Agent")
    st.markdown("🟢 Follow-up Agent")

    st.markdown("---")

    st.caption("NexaAI v1.0")
    st.caption("● All agents operational")


# =========================================================
# HERO
# =========================================================

st.markdown("""
<div class="hero">

<div class="hero-small">
✦ Autonomous Sales Workspace
</div>

<h1>Turn prospects into conversations.</h1>

<p>
Research prospects, score leads, create personalized emails
and automate follow-ups using your AI multi-agent system.
</p>

</div>
""", unsafe_allow_html=True)


# =========================================================
# DASHBOARD
# =========================================================

if page == "Dashboard":

    # KPI ROW

    c1, c2, c3, c4 = st.columns(4)

    cards = [
        ("Total Leads", "248", "+18.4%"),
        ("High Quality", "86", "+12.1%"),
        ("Emails Generated", "1,426", "+24.8%"),
        ("Average Score", "8.4/10", "+0.6")
    ]

    for col, (title, number, growth) in zip(
        [c1, c2, c3, c4], cards
    ):

        with col:

            st.markdown(f"""
            <div class="kpi">

                <div class="kpi-title">
                    {title}
                </div>

                <div class="kpi-number">
                    {number}
                </div>

                <div class="kpi-growth">
                    ↗ {growth} this month
                </div>

            </div>
            """, unsafe_allow_html=True)


    # AGENTS

    st.markdown(
        "### 🤖 Multi-Agent System"
    )

    agents = [
        ("🔎", "Research Agent",
         "Company & prospect intelligence"),

        ("🎯", "Lead Scoring Agent",
         "AI qualification & scoring"),

        ("✉️", "Email Agent",
         "Personalized outreach"),

        ("🔄", "Follow-up Agent",
         "Automated follow-up sequences")
    ]

    agent_cols = st.columns(4)

    for col, agent in zip(agent_cols, agents):

        with col:

            st.markdown(f"""
            <div class="agent-card">

                <div class="agent-icon">
                    {agent[0]}
                </div>

                <div class="agent-name">
                    {agent[1]}
                </div>

                <div class="agent-desc">
                    {agent[2]}
                </div>

                <div class="online">
                    ● ONLINE
                </div>

            </div>
            """, unsafe_allow_html=True)


    # CHARTS

    st.markdown("### 📊 Sales Intelligence")

    left, right = st.columns([1.5, 1])

    with left:

        df = pd.DataFrame({
            "Month": [
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug"
            ],

            "Qualified Leads": [
                24,
                31,
                38,
                46,
                58,
                71
            ],

            "Emails": [
                120,
                165,
                190,
                245,
                310,
                385
            ]
        })

        fig = px.area(
            df,
            x="Month",
            y=[
                "Qualified Leads",
                "Emails"
            ],
            template="plotly_white"
        )

        fig.update_layout(
            height=350,
            margin=dict(
                l=10,
                r=10,
                t=20,
                b=10
            ),
            legend_title=""
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
            key="sales_performance"
        )


    with right:

        score_df = pd.DataFrame({
            "Quality": [
                "High",
                "Medium",
                "Low"
            ],

            "Leads": [
                86,
                103,
                59
            ]
        })

        fig = px.pie(
            score_df,
            names="Quality",
            values="Leads",
            hole=.65,
            template="plotly_white"
        )

        fig.update_layout(
            height=350,
            margin=dict(
                l=5,
                r=5,
                t=20,
                b=5
            )
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
            key="lead_quality"
        )


    # RECENT LEADS

    st.markdown("### 👥 Recent Prospects")

    leads = [
        ("SA", "Sarah Ahmed",
         "TechNova Solutions", "9.6/10"),

        ("MK", "Michael Khan",
         "CloudBridge", "9.1/10"),

        ("AR", "Ali Raza",
         "Vertex Systems", "8.8/10"),

        ("JM", "James Miller",
         "NorthStar Labs", "8.5/10"),

        ("HS", "Hina Shah",
         "DataPulse", "8.2/10")
    ]

    html = '<div class="panel">'

    for avatar, name, company, score in leads:

        html += f"""
        <div class="lead-row">

            <div class="avatar">
                {avatar}
            </div>

            <div>

                <div class="lead-name">
                    {name}
                </div>

                <div class="company">
                    {company}
                </div>

            </div>

            <div class="score">
                {score}
            </div>

        </div>
        """

    html += "</div>"

    st.markdown(
        html,
        unsafe_allow_html=True
    )


# =========================================================
# LEADS
# =========================================================

elif page == "Leads":

    st.markdown("### 👥 Lead Management")

    search = st.text_input(
        "Search",
        placeholder="Search name, company or email..."
    )

    data = pd.DataFrame({

        "Name": [
            "Sarah Ahmed",
            "Michael Khan",
            "Ali Raza",
            "James Miller",
            "Hina Shah"
        ],

        "Company": [
            "TechNova Solutions",
            "CloudBridge",
            "Vertex Systems",
            "NorthStar Labs",
            "DataPulse"
        ],

        "Lead Score": [
            9.6,
            9.1,
            8.8,
            8.5,
            8.2
        ],

        "Status": [
            "🔥 Hot",
            "🔥 Hot",
            "🟡 Warm",
            "🟡 Warm",
            "🔥 Hot"
        ]
    })

    if search:

        data = data[
            data.astype(str)
            .apply(
                lambda x:
                x.str.contains(
                    search,
                    case=False
                ).any(),
                axis=1
            )
        ]

    st.dataframe(
        data,
        use_container_width=True,
        hide_index=True
    )


# =========================================================
# AI RESEARCH
# =========================================================

elif page == "AI Research":

    st.markdown("### 🔎 AI Prospect Research")

    company = st.text_input(
        "Company Name",
        placeholder="Enter company..."
    )

    website = st.text_input(
        "Website",
        placeholder="https://company.com"
    )

    if st.button(
        "✦ Research Prospect",
        type="primary",
        use_container_width=True
    ):

        st.success(
            "Research Agent completed analysis."
        )

        st.markdown("""
        <div class="panel">

        <h3>AI Research Report</h3>

        <b>Company Overview</b>

        <p>
        Growth-oriented technology company with
        strong potential for AI automation and
        sales workflow optimization.
        </p>

        <b>Buying Signals</b>

        <ul>
        <li>Growing technology team</li>
        <li>Increasing digital operations</li>
        <li>Potential automation requirements</li>
        </ul>

        <b>Recommended Approach</b>

        <p>
        Lead with measurable productivity gains,
        automation and reduced operational costs.
        </p>

        </div>
        """, unsafe_allow_html=True)


# =========================================================
# EMAIL STUDIO
# =========================================================

elif page == "Email Studio":

    st.markdown("### ✉️ AI Email Studio")

    prospect = st.text_input(
        "Prospect",
        placeholder="Sarah Ahmed — TechNova"
    )

    tone = st.selectbox(
        "Email Tone",
        [
            "Professional",
            "Friendly",
            "Executive",
            "Short & Direct"
        ]
    )

    context = st.text_area(
        "Campaign Context",
        height=140,
        placeholder="Describe your product and prospect pain point..."
    )

    if st.button(
        "✦ Generate Email",
        type="primary",
        use_container_width=True
    ):

        email = f"""Subject: A quick idea for {prospect or "your team"}

Hi {prospect or "there"},

I noticed your team is growing and thought
there may be an opportunity to improve your
sales workflow with AI automation.

Would you be open to a quick 15-minute
conversation this week?

Best regards,
NexaAI
"""

        st.text_area(
            "Generated Email",
            email,
            height=300
        )


# =========================================================
# FOLLOW UPS
# =========================================================

elif page == "Follow-ups":

    st.markdown("### 🔄 AI Follow-up Center")

    st.markdown("""
    <div class="panel">

    <div class="panel-title">
    Automated Follow-up Sequence
    </div>

    <div class="panel-sub">
    Let the Follow-up Agent create the next-best action.
    </div>

    📨 Day 0 — Initial email

    <br><br>

    🔔 Day 3 — Value reminder

    <br><br>

    💡 Day 7 — Case study

    <br><br>

    📞 Day 14 — Final follow-up

    </div>
    """, unsafe_allow_html=True)

    st.button(
        "✦ Generate AI Sequence",
        type="primary",
        use_container_width=True
    )


# =========================================================
# ANALYTICS
# =========================================================

elif page == "Analytics":

    st.markdown("### 📈 Sales Analytics")

    df = pd.DataFrame({

        "Channel": [
            "Email",
            "LinkedIn",
            "Referral",
            "Website"
        ],

        "Leads": [
            124,
            67,
            31,
            26
        ],

        "Conversion": [
            18.2,
            14.8,
            22.5,
            11.4
        ]
    })

    c1, c2, c3 = st.columns(3)

    c1.metric(
        "Conversion Rate",
        "17.8%",
        "+3.2%"
    )

    c2.metric(
        "Qualified Leads",
        "86",
        "+12"
    )

    c3.metric(
        "Pipeline Value",
        "$428K",
        "+18%"
    )

    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True
    )

    fig = px.bar(
        df,
        x="Channel",
        y="Conversion",
        template="plotly_white"
    )

    fig.update_layout(
        height=380,
        yaxis_title="Conversion %"
    )

    st.plotly_chart(
        fig,
        use_container_width=True,
        key="analytics_conversion"
    )