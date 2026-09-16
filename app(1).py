
import os
import re
import html
import streamlit as st
from typing import TypedDict

from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq

# ============================================================
# CONFIG
# ============================================================

load_dotenv()

st.set_page_config(
    page_title="AgentFlow Studio",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ============================================================
# CUSTOM CSS — UNIQUE DARK AGENT CONTROL CENTER
# ============================================================

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

html, body, [class*="css"] {
    font-family: Inter, sans-serif;
}

.stApp {
    background:
        radial-gradient(circle at 10% 0%, rgba(99,102,241,.13), transparent 30%),
        radial-gradient(circle at 90% 10%, rgba(16,185,129,.10), transparent 28%),
        #07111f;
    color: #e5e7eb;
}

.block-container {
    max-width: 1450px;
    padding-top: 1.2rem;
    padding-bottom: 3rem;
}

/* Sidebar */
section[data-testid="stSidebar"] {
    background: #081525;
    border-right: 1px solid rgba(148,163,184,.12);
}

section[data-testid="stSidebar"] * {
    color: #dbeafe !important;
}

/* Header */
.hero {
    padding: 28px 30px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(15,23,42,.96), rgba(15,23,42,.70));
    border: 1px solid rgba(148,163,184,.15);
    box-shadow: 0 20px 60px rgba(0,0,0,.20);
    margin-bottom: 20px;
}

.hero-row {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:20px;
}

.brand {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -.8px;
}

.gradient {
    background: linear-gradient(90deg,#818cf8,#34d399);
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
}

.subtitle {
    color:#94a3b8;
    margin-top:7px;
    font-size:14px;
}

.live {
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:8px 13px;
    border-radius:999px;
    background:rgba(16,185,129,.10);
    border:1px solid rgba(16,185,129,.25);
    color:#6ee7b7;
    font-size:12px;
    font-weight:700;
}

.dot {
    width:8px;
    height:8px;
    border-radius:50%;
    background:#34d399;
    box-shadow:0 0 12px #34d399;
}

/* Cards */
.card {
    background:rgba(15,23,42,.78);
    border:1px solid rgba(148,163,184,.13);
    border-radius:20px;
    padding:20px;
    box-shadow:0 12px 40px rgba(0,0,0,.16);
}

.card-title {
    font-size:13px;
    font-weight:700;
    color:#94a3b8;
    text-transform:uppercase;
    letter-spacing:.08em;
    margin-bottom:9px;
}

.card-value {
    font-size:21px;
    font-weight:800;
    color:#f8fafc;
}

.muted {
    color:#64748b;
    font-size:12px;
}

/* Agent cards */
.agent {
    min-height:145px;
    border-radius:18px;
    padding:18px;
    background:rgba(15,23,42,.82);
    border:1px solid rgba(148,163,184,.12);
    position:relative;
    overflow:hidden;
}

.agent::after {
    content:"";
    position:absolute;
    left:0;
    top:0;
    width:100%;
    height:3px;
    background:linear-gradient(90deg,#6366f1,#34d399);
    opacity:.85;
}

.agent-icon {
    font-size:28px;
}

.agent-name {
    font-size:15px;
    font-weight:800;
    margin-top:10px;
}

.agent-role {
    color:#64748b;
    font-size:11px;
    margin-top:4px;
}

.status {
    display:inline-block;
    margin-top:15px;
    padding:5px 9px;
    border-radius:999px;
    font-size:10px;
    font-weight:800;
}

.ready {
    background:rgba(100,116,139,.14);
    color:#94a3b8;
}

.running {
    background:rgba(99,102,241,.16);
    color:#a5b4fc;
}

.complete {
    background:rgba(16,185,129,.13);
    color:#6ee7b7;
}

.pass {
    background:rgba(16,185,129,.13);
    color:#6ee7b7;
}

/* Flow */
.flow {
    text-align:center;
    color:#475569;
    font-size:20px;
    padding:18px 0;
}

/* Inputs */
div[data-testid="stTextArea"] textarea,
div[data-testid="stTextInput"] input {
    background:#0b1728 !important;
    color:#f8fafc !important;
    border:1px solid #24344d !important;
    border-radius:14px !important;
}

div[data-testid="stTextArea"] textarea:focus,
div[data-testid="stTextInput"] input:focus {
    border-color:#6366f1 !important;
    box-shadow:0 0 0 1px #6366f1 !important;
}

/* Buttons */
.stButton > button {
    border-radius:13px !important;
    min-height:44px !important;
    font-weight:800 !important;
    border:1px solid rgba(129,140,248,.35) !important;
}

.stButton > button[kind="primary"] {
    background:linear-gradient(90deg,#4f46e5,#6366f1) !important;
    color:white !important;
}

/* Result */
.result {
    background:#081525;
    border:1px solid rgba(52,211,153,.20);
    border-radius:20px;
    padding:25px;
}

.result-head {
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:15px;
}

.result-title {
    font-size:20px;
    font-weight:800;
}

.success-pill {
    color:#6ee7b7;
    background:rgba(16,185,129,.12);
    border:1px solid rgba(16,185,129,.20);
    border-radius:999px;
    padding:6px 11px;
    font-size:11px;
    font-weight:800;
}

/* Metrics */
.metric {
    background:#0b1728;
    border:1px solid rgba(148,163,184,.10);
    border-radius:16px;
    padding:16px;
}

.metric-label {
    color:#64748b;
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:.08em;
}

.metric-value {
    color:#f8fafc;
    font-size:25px;
    font-weight:800;
    margin-top:5px;
}

/* Expander */
div[data-testid="stExpander"] {
    background:#0b1728;
    border:1px solid rgba(148,163,184,.10);
    border-radius:15px;
}

/* Hide default menu/footer */
#MainMenu {visibility:hidden;}
footer {visibility:hidden;}
</style>
""", unsafe_allow_html=True)

# ============================================================
# STATE
# ============================================================

class AgentState(TypedDict):
    task: str
    research_notes: str
    draft: str
    review_feedback: str
    final_output: str
    review_status: str
    retry_count: int

MAX_RETRIES = 3

# ============================================================
# MODEL
# ============================================================

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

# ============================================================
# AGENTS
# ============================================================

def manager(state: AgentState):
    return {"research_notes": "Research required before writing."}

def researcher(state: AgentState):
    prompt = f"""
You are a research specialist.

Research this task:
{state["task"]}

Provide concise, useful research notes covering:
- Definition
- Important facts
- Applications
- Benefits
- Risks and considerations

Do not write the final article.
"""
    response = llm.invoke(prompt)
    return {"research_notes": response.content}

def writer(state: AgentState):
    feedback = state["review_feedback"]
    revision = bool(feedback)

    if revision:
        prompt = f"""
You are a professional content writer revising an article.

TASK:
{state["task"]}

RESEARCH:
{state["research_notes"]}

REVIEW FEEDBACK:
{feedback}

Rewrite the article and address the reviewer's actual concerns.

Requirements:
- Strong title
- Clear introduction
- Useful headings
- Simple professional language
- Specific examples where useful
- Balanced benefits and risks
- Clear conclusion
- Return ONLY the article
"""
    else:
        prompt = f"""
You are a professional content writer.

TASK:
{state["task"]}

RESEARCH:
{state["research_notes"]}

Write a high-quality professional article.

Requirements:
- Strong title
- Clear introduction
- Useful headings
- Simple language
- Specific examples
- Professional and engaging style
- Clear conclusion
- Return ONLY the article
"""
    response = llm.invoke(prompt)

    result = {"draft": response.content}

    if revision:
        result["retry_count"] = state["retry_count"] + 1

    return result

def reviewer(state: AgentState):
    prompt = f"""
You are a strict professional editor.

Review this article:

{state["draft"]}

Check:
- Accuracy
- Clarity
- Structure
- Grammar
- Relevance
- Specific examples
- Professional quality

Use this exact final format:

DECISION: PASS
or
DECISION: REVISE

Then give concise feedback.

IMPORTANT:
Do not write PASS and REVISE as decisions in the same response.
"""
    response = llm.invoke(prompt)
    review = response.content

    upper = review.upper()
    if "DECISION: REVISE" in upper:
        status = "REVISE"
    elif "DECISION: PASS" in upper:
        status = "PASS"
    else:
        status = "REVISE"

    return {
        "review_feedback": review,
        "review_status": status,
    }

def review_router(state: AgentState):
    if state["review_status"] == "PASS":
        return "pass"

    if state["retry_count"] >= MAX_RETRIES:
        return "pass"

    return "revise"

def publisher(state: AgentState):
    prompt = f"""
You are the final publishing editor.

Prepare this article for publication:

{state["draft"]}

Rules:
- Preserve meaning
- Keep title and useful headings
- Correct obvious grammar/formatting
- Improve readability
- Do not mention agents, reviewers, prompts, or AI
- Return ONLY the final article
"""
    response = llm.invoke(prompt)
    return {"final_output": response.content}

# ============================================================
# GRAPH
# ============================================================

@st.cache_resource
def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("manager", manager)
    graph.add_node("researcher", researcher)
    graph.add_node("writer", writer)
    graph.add_node("reviewer", reviewer)
    graph.add_node("publisher", publisher)

    graph.add_edge(START, "manager")
    graph.add_edge("manager", "researcher")
    graph.add_edge("researcher", "writer")
    graph.add_edge("writer", "reviewer")

    graph.add_conditional_edges(
        "reviewer",
        review_router,
        {
            "pass": "publisher",
            "revise": "writer",
        },
    )

    graph.add_edge("publisher", END)

    return graph.compile()

app = build_graph()

# ============================================================
# SESSION STATE
# ============================================================

defaults = {
    "result": None,
    "task": "",
    "run_count": 0,
}

for key, value in defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value

# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:
    st.markdown("## ⚙️ Control Center")
    st.caption("Multi-Agent AI Workspace")

    st.markdown("""
    <div class="card">
        <div class="card-title">LLM Provider</div>
        <div class="card-value">🟢 Groq Connected</div>
        <div class="muted">llama-3.3-70b-versatile</div>
    </div>
    """, unsafe_allow_html=True)

    st.write("")

    st.markdown("""
    <div class="card">
        <div class="card-title">Framework</div>
        <div class="card-value">LangGraph</div>
        <div class="muted">Stateful agent workflow</div>
    </div>
    """, unsafe_allow_html=True)

    st.write("")

    st.markdown("""
    <div class="card">
        <div class="card-title">Observability</div>
        <div class="card-value">🟢 LangSmith</div>
        <div class="muted">Tracing controlled by your .env</div>
    </div>
    """, unsafe_allow_html=True)

    st.write("")
    st.caption("Tip: change the task below and run the workflow again.")

# ============================================================
# HEADER
# ============================================================

st.markdown("""
<div class="hero">
    <div class="hero-row">
        <div>
            <div class="brand">🤖 <span class="gradient">AgentFlow Studio</span></div>
            <div class="subtitle">
                A visual control center for your LangGraph multi-agent system
            </div>
        </div>
        <div class="live"><span class="dot"></span> SYSTEM ONLINE</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ============================================================
# AGENT WORKFLOW
# ============================================================

st.markdown("### Agent Workflow")

agents = [
    ("🧠", "Manager", "Task orchestration"),
    ("🔎", "Researcher", "Research & facts"),
    ("✍️", "Writer", "Content generation"),
    ("🔍", "Reviewer", "Quality control"),
    ("📢", "Publisher", "Final publication"),
]

cols = st.columns(5)

for col, (icon, name, role) in zip(cols, agents):
    with col:
        status = "Completed" if st.session_state.result else "Ready"
        css = "complete" if st.session_state.result else "ready"
        st.markdown(f"""
        <div class="agent">
            <div class="agent-icon">{icon}</div>
            <div class="agent-name">{name}</div>
            <div class="agent-role">{role}</div>
            <span class="status {css}">{status}</span>
        </div>
        """, unsafe_allow_html=True)

st.markdown('<div class="flow">↓ &nbsp; ↓ &nbsp; ↓ &nbsp; ↓</div>', unsafe_allow_html=True)

# ============================================================
# TASK BUILDER
# ============================================================

st.markdown("### 🎯 Create a New Task")

task = st.text_area(
    "What should your AI agents do?",
    value=st.session_state.task,
    height=120,
    placeholder=(
        "Example: Write a professional blog post about Artificial Intelligence "
        "and explain its impact on education in Pakistan."
    ),
    label_visibility="visible",
)

c1, c2, c3 = st.columns([2.5, 1, 1])

with c1:
    run = st.button(
        "🚀 Run Multi-Agent Workflow",
        type="primary",
        width="stretch",
    )

with c2:
    if st.button("🧹 Clear", width="stretch"):
        st.session_state.result = None
        st.session_state.task = ""
        st.rerun()

with c3:
    st.metric("Runs", st.session_state.run_count)

# ============================================================
# EXECUTION
# ============================================================

if run:
    if not task.strip():
        st.warning("Please enter a task first.")
    else:
        st.session_state.task = task

        initial_state: AgentState = {
            "task": task.strip(),
            "research_notes": "",
            "draft": "",
            "review_feedback": "",
            "final_output": "",
            "review_status": "",
            "retry_count": 0,
        }

        progress = st.status(
            "⚡ Running multi-agent workflow...",
            expanded=True,
        )

        try:
            progress.write("🧠 Manager → assigning the task")
            progress.write("🔎 Researcher → gathering research")
            progress.write("✍️ Writer → creating content")
            progress.write("🔍 Reviewer → checking quality")
            result = app.invoke(initial_state)
            progress.write("📢 Publisher → preparing final output")

            st.session_state.result = result
            st.session_state.run_count += 1
            progress.update(
                label="✅ Workflow completed successfully",
                state="complete",
                expanded=False,
            )

            st.rerun()

        except Exception as e:
            progress.update(
                label="❌ Workflow failed",
                state="error",
                expanded=True,
            )
            st.error(str(e))

# ============================================================
# RESULTS
# ============================================================

result = st.session_state.result

if result:
    st.markdown("## 📊 Execution Summary")

    status = result.get("review_status", "UNKNOWN")
    revisions = result.get("retry_count", 0)

    m1, m2, m3, m4 = st.columns(4)

    metrics = [
        ("AGENTS", "5"),
        ("STATUS", "PASS" if status == "PASS" else status),
        ("REVISIONS", str(revisions)),
        ("RUN", str(st.session_state.run_count)),
    ]

    for col, (label, value) in zip([m1, m2, m3, m4], metrics):
        with col:
            st.markdown(
                f"""
                <div class="metric">
                    <div class="metric-label">{label}</div>
                    <div class="metric-value">{value}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.write("")

    # Final output
    st.markdown("""
    <div class="result">
        <div class="result-head">
            <div class="result-title">📄 Final Published Output</div>
            <div class="success-pill">✓ PUBLISHED</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    final_output = result.get("final_output", "")

    st.markdown(final_output)

    st.download_button(
        "⬇️ Download Final Article",
        data=final_output,
        file_name="published_article.md",
        mime="text/markdown",
        width="stretch",
    )

    st.write("")

    # Details
    st.markdown("### 🔍 Agent Intelligence")

    with st.expander("📚 Research Notes"):
        st.markdown(result.get("research_notes", "No research notes."))

    with st.expander("✍️ Writer Draft"):
        st.markdown(result.get("draft", "No draft available."))

    with st.expander("🔍 Reviewer Feedback"):
        st.markdown(result.get("review_feedback", "No review feedback."))

    with st.expander("🧭 Workflow State"):
        safe_state = {
            "review_status": result.get("review_status"),
            "retry_count": result.get("retry_count"),
            "task": result.get("task"),
        }
        st.json(safe_state)

else:
    st.markdown("""
    <div class="card" style="text-align:center;padding:35px;">
        <div style="font-size:38px;">🛰️</div>
        <div style="font-size:20px;font-weight:800;margin-top:10px;">
            Your agents are standing by
        </div>
        <div class="muted" style="margin-top:7px;">
            Enter a task above and launch the workflow.
        </div>
    </div>
    """, unsafe_allow_html=True)
