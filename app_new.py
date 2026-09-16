
import sqlite3
from datetime import datetime
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(
    page_title="SalesPilot AI — Command Center",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------- Theme / animations ----------
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
    --bg: #070b14;
    --panel: rgba(16, 23, 38, .78);
    --panel2: rgba(20, 29, 48, .72);
    --line: rgba(148, 163, 184, .15);
    --text: #f7f9fc;
    --muted: #91a0b8;
    --accent: #7c5cff;
    --cyan: #22d3ee;
    --green: #34d399;
    --orange: #f59e0b;
}

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

.stApp {
    background:
      radial-gradient(circle at 10% 10%, rgba(124,92,255,.16), transparent 28%),
      radial-gradient(circle at 90% 8%, rgba(34,211,238,.10), transparent 24%),
      radial-gradient(circle at 75% 90%, rgba(52,211,153,.07), transparent 24%),
      var(--bg);
    color: var(--text);
}

[data-testid="stHeader"] { background: transparent; }
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, rgba(9,14,25,.96), rgba(7,11,20,.98));
    border-right: 1px solid var(--line);
}
[data-testid="stSidebar"] * { color: #dbe4f2; }

.block-container {
    padding-top: 1.6rem;
    padding-bottom: 3rem;
    max-width: 1500px;
}

.hero {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(124,92,255,.24);
    border-radius: 28px;
    padding: 30px 32px;
    margin-bottom: 22px;
    background:
      linear-gradient(135deg, rgba(124,92,255,.15), rgba(34,211,238,.05)),
      rgba(11,17,29,.78);
    box-shadow: 0 20px 80px rgba(0,0,0,.30);
}
.hero:before {
    content: "";
    position: absolute;
    width: 280px; height: 280px;
    right: -70px; top: -120px;
    border-radius: 50%;
    background: rgba(124,92,255,.18);
    filter: blur(20px);
    animation: float 6s ease-in-out infinite;
}
.hero:after {
    content: "";
    position: absolute;
    width: 180px; height: 180px;
    right: 180px; bottom: -100px;
    border-radius: 50%;
    background: rgba(34,211,238,.12);
    filter: blur(18px);
    animation: float2 7s ease-in-out infinite;
}
@keyframes float {
    0%,100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(18px) scale(1.08); }
}
@keyframes float2 {
    0%,100% { transform: translate(0,0); }
    50% { transform: translate(-20px,-14px); }
}
.hero-content { position: relative; z-index: 2; }
.eyebrow {
    color: #a99cff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .16em;
    text-transform: uppercase;
}
.hero h1 {
    font-size: clamp(30px, 4vw, 52px);
    line-height: 1.02;
    margin: 8px 0 12px;
    letter-spacing: -.045em;
}
.gradient {
    background: linear-gradient(90deg, #ffffff, #b9adff 45%, #7de8f8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.hero p { color: #aab7ca; max-width: 760px; margin: 0; }

.live {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 18px;
    padding: 8px 12px;
    border: 1px solid rgba(52,211,153,.24);
    border-radius: 999px;
    background: rgba(52,211,153,.08);
    color: #8af0c8;
    font-size: 12px;
    font-weight: 700;
}
.dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 0 5px rgba(52,211,153,.10), 0 0 18px rgba(52,211,153,.8);
    animation: pulse 1.8s infinite;
}
@keyframes pulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(.75); opacity: .55; }
}

.metric {
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 18px 19px;
    background: linear-gradient(145deg, rgba(19,27,44,.86), rgba(12,18,30,.74));
    box-shadow: 0 12px 35px rgba(0,0,0,.18);
    transition: transform .22s ease, border-color .22s ease;
}
.metric:hover {
    transform: translateY(-4px);
    border-color: rgba(124,92,255,.42);
}
.metric-label { color: var(--muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.metric-value { font-size: 31px; font-weight: 800; margin-top: 5px; letter-spacing: -.03em; }
.metric-sub { color: #7f8da5; font-size: 12px; margin-top: 5px; }

.section-title {
    font-size: 19px;
    font-weight: 800;
    margin: 25px 0 12px;
}
.glass {
    border: 1px solid var(--line);
    border-radius: 22px;
    padding: 20px;
    background: var(--panel);
    backdrop-filter: blur(18px);
}
.agent {
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 16px;
    background: linear-gradient(145deg, rgba(21,29,47,.82), rgba(11,17,28,.82));
    transition: all .22s ease;
    margin-bottom: 10px;
}
.agent:hover {
    transform: translateX(5px);
    border-color: rgba(34,211,238,.34);
}
.agent-name { font-weight: 800; }
.agent-role { color: var(--muted); font-size: 12px; margin-top: 3px; }
.badge {
    display: inline-block;
    margin-top: 9px;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
}
.ready { color:#83e9c4; background:rgba(52,211,153,.10); border:1px solid rgba(52,211,153,.18); }
.idle { color:#aeb9ca; background:rgba(148,163,184,.08); border:1px solid rgba(148,163,184,.14); }

div.stButton > button {
    border-radius: 12px;
    border: 1px solid rgba(124,92,255,.34);
    background: linear-gradient(135deg, rgba(124,92,255,.22), rgba(34,211,238,.10));
    color: white;
    font-weight: 700;
    transition: all .2s ease;
}
div.stButton > button:hover {
    transform: translateY(-2px);
    border-color: rgba(124,92,255,.65);
    box-shadow: 0 10px 30px rgba(124,92,255,.16);
}

[data-testid="stDataFrame"] {
    border-radius: 16px;
    overflow: hidden;
}
.stTabs [data-baseweb="tab-list"] {
    gap: 6px;
    background: rgba(10,15,25,.5);
    padding: 5px;
    border-radius: 14px;
}
.stTabs [data-baseweb="tab"] {
    border-radius: 10px;
}
.small-note { color:#728097; font-size:11px; }
</style>
""", unsafe_allow_html=True)


# ---------- Helpers ----------
DB_PATH = "sales_agent.db"

def load_database():
    try:
        con = sqlite3.connect(DB_PATH)
        tables = pd.read_sql_query(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", con
        )["name"].tolist()
        data = {}
        for table in tables:
            try:
                data[table] = pd.read_sql_query(f'SELECT * FROM "{table}"', con)
            except Exception:
                data[table] = pd.DataFrame()
        con.close()
        return data
    except Exception:
        return {}

def first_nonempty_table(data):
    for name, df in data.items():
        if not df.empty:
            return name, df
    return None, pd.DataFrame()

def numeric_total(df):
    if df.empty:
        return 0
    nums = df.select_dtypes(include="number")
    if nums.empty:
        return 0
    return int(nums.shape[0])

db = load_database()
table_name, table_df = first_nonempty_table(db)

# ---------- Sidebar ----------
with st.sidebar:
    st.markdown("## ⚡ SalesPilot")
    st.caption("AI Sales Command Center")
    st.divider()

    page = st.radio(
        "WORKSPACE",
        ["Command Center", "Leads", "AI Agents", "Analytics"],
        label_visibility="visible",
    )

    st.divider()
    st.markdown("**SYSTEM STATUS**")
    st.markdown('<div class="live"><span class="dot"></span> All systems operational</div>', unsafe_allow_html=True)
    st.markdown("")
    st.caption(f"Database: {'Connected' if db else 'Not found'}")
    st.caption(f"Updated: {datetime.now().strftime('%d %b %Y • %I:%M %p')}")

# ---------- Hero ----------
st.markdown("""
<div class="hero">
  <div class="hero-content">
    <div class="eyebrow">Multi-Agent Sales Intelligence</div>
    <h1>Turn leads into <span class="gradient">conversations.</span></h1>
    <p>A premium command center for lead scoring, research, outreach and intelligent follow-ups — with your existing sales database at the center.</p>
    <div class="live"><span class="dot"></span> AI workspace online</div>
  </div>
</div>
""", unsafe_allow_html=True)

# ---------- Command Center ----------
if page == "Command Center":
    rows = len(table_df) if not table_df.empty else 0
    tables = len(db)

    cols = st.columns(4)
    metrics = [
        ("LEADS", rows, "records detected"),
        ("DATASETS", tables, "database tables"),
        ("AI AGENTS", 4, "ready to orchestrate"),
        ("PIPELINE", "LIVE", "workspace status"),
    ]
    for col, (label, value, sub) in zip(cols, metrics):
        with col:
            st.markdown(
                f'<div class="metric"><div class="metric-label">{label}</div>'
                f'<div class="metric-value">{value}</div><div class="metric-sub">{sub}</div></div>',
                unsafe_allow_html=True,
            )

    st.markdown('<div class="section-title">Agent orchestration</div>', unsafe_allow_html=True)
    left, right = st.columns([1.25, 1])

    with left:
        st.markdown('<div class="glass">', unsafe_allow_html=True)
        st.markdown("### ⚡ Agent Pipeline")
        agents = [
            ("01", "Research Agent", "Finds and enriches lead intelligence", "READY"),
            ("02", "Lead Scoring Agent", "Prioritizes the highest-value opportunities", "READY"),
            ("03", "Email Agent", "Generates personalized outreach", "READY"),
            ("04", "Follow-up Agent", "Keeps conversations moving", "READY"),
        ]
        for num, name, role, status in agents:
            st.markdown(
                f'<div class="agent"><b>{num}</b>&nbsp;&nbsp;'
                f'<span class="agent-name">{name}</span>'
                f'<div class="agent-role">{role}</div>'
                f'<span class="badge ready">{status}</span></div>',
                unsafe_allow_html=True,
            )
        st.markdown('</div>', unsafe_allow_html=True)

    with right:
        st.markdown('<div class="glass">', unsafe_allow_html=True)
        st.markdown("### ✨ Quick actions")
        st.write("Use these as the starting points for your sales workflow.")
        if st.button("🔎 Open lead intelligence", use_container_width=True):
            st.info("Switch to **Leads** from the sidebar.")
        if st.button("🧠 Inspect agent workspace", use_container_width=True):
            st.info("Switch to **AI Agents** from the sidebar.")
        if st.button("📊 View analytics", use_container_width=True):
            st.info("Switch to **Analytics** from the sidebar.")
        st.markdown('</div>', unsafe_allow_html=True)

    if not table_df.empty:
        st.markdown('<div class="section-title">Live database preview</div>', unsafe_allow_html=True)
        st.dataframe(table_df.head(8), use_container_width=True, hide_index=True)
    else:
        st.markdown(
            '<div class="glass"><b>No sales data table detected yet.</b><br>'
            '<span class="small-note">The UI is ready and will automatically show database records when sales_agent.db contains tables.</span></div>',
            unsafe_allow_html=True,
        )

# ---------- Leads ----------
elif page == "Leads":
    st.markdown('<div class="section-title">Lead intelligence</div>', unsafe_allow_html=True)

    if table_df.empty:
        st.warning("No non-empty table was found in sales_agent.db.")
    else:
        st.caption(f"Showing: {table_name}")
        search = st.text_input("Search leads", placeholder="Type a name, company, email, or keyword…")
        view = table_df.copy()

        if search:
            mask = view.astype(str).apply(
                lambda col: col.str.contains(search, case=False, na=False)
            ).any(axis=1)
            view = view[mask]

        st.dataframe(view, use_container_width=True, hide_index=True)

# ---------- Agents ----------
elif page == "AI Agents":
    st.markdown('<div class="section-title">Multi-agent workspace</div>', unsafe_allow_html=True)
    st.caption("Visual control center for the agent modules already present in your project.")

    cards = st.columns(2)
    agent_info = [
        ("🔎", "Research Agent", "research.py", "Lead and company intelligence"),
        ("🎯", "Lead Scoring Agent", "lead_scoring.py", "Qualification and prioritization"),
        ("✉️", "Email Generator", "email_generator.py", "Personalized outreach"),
        ("🔁", "Follow-up Agent", "followup.py", "Follow-up sequencing"),
    ]
    for col, (icon, name, file, desc) in zip(cards * 2, agent_info):
        with col:
            st.markdown(
                f'<div class="glass"><div style="font-size:30px">{icon}</div>'
                f'<h3>{name}</h3><p style="color:#91a0b8">{desc}</p>'
                f'<span class="badge ready">MODULE • {file}</span></div>',
                unsafe_allow_html=True,
            )
            st.write("")

# ---------- Analytics ----------
elif page == "Analytics":
    st.markdown('<div class="section-title">Sales analytics</div>', unsafe_allow_html=True)

    if table_df.empty:
        st.info("Analytics will appear automatically when the database contains data.")
    else:
        numeric_cols = table_df.select_dtypes(include="number").columns.tolist()

        if numeric_cols:
            metric_col = st.selectbox("Numeric field", numeric_cols)
            chart = px.histogram(
                table_df,
                x=metric_col,
                template="plotly_dark",
                title=f"Distribution of {metric_col}",
            )
            chart.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font=dict(color="#dbe4f2"),
            )
            st.plotly_chart(chart, use_container_width=True)
        else:
            st.info("The current database table has no numeric columns to chart.")

st.markdown(
    '<div style="text-align:center;margin-top:42px;color:#58657a;font-size:11px">'
    'SalesPilot AI • Animated Command Center • Built for your multi-agent system'
    '</div>',
    unsafe_allow_html=True,
)
