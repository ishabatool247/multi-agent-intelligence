from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from dotenv import load_dotenv

# ==========================================
# LOAD ENVIRONMENT
# ==========================================

load_dotenv()


# ==========================================
# SHARED STATE
# ==========================================

class AgentState(TypedDict):
    task: str
    research_notes: str
    draft: str
    review_feedback: str
    final_output: str
    review_status: str
    retry_count: int


# ==========================================
# AI MODEL
# ==========================================

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0
)


# ==========================================
# MANAGER
# ==========================================

def manager(state: AgentState):

    print("\n--- MANAGER ---")

    task = state["task"]

    print(f"Manager received task: {task}")

    return {
        "research_notes": "Research is required before writing."
    }


# ==========================================
# RESEARCHER
# ==========================================

def researcher(state: AgentState):

    print("\n--- RESEARCHER ---")

    task = state["task"]

    print(f"Researcher is researching: {task}")

    prompt = f"""
You are a research specialist.

Research the following topic:

{task}

Provide useful and accurate research notes.

Include:

- Definition
- Important facts
- Main applications
- Benefits
- Important considerations

Keep the research organized and concise.
"""

    response = llm.invoke(prompt)

    return {
        "research_notes": response.content
    }


# ==========================================
# WRITER
# ==========================================

def writer(state: AgentState):

    print("\n--- WRITER ---")

    task = state["task"]
    research = state["research_notes"]
    feedback = state["review_feedback"]
    retry_count = state["retry_count"]

    # ======================================
    # REVISION
    # ======================================

    if feedback:

        retry_count += 1

        print("Writer is revising the draft...")
        print(f"Revision number: {retry_count}")

        prompt = f"""
You are a professional content writer.

The previous blog post was reviewed and requires revision.

TASK:
{task}

RESEARCH:
{research}

REVIEWER FEEDBACK:
{feedback}

Rewrite the blog post and fix all important issues
identified by the reviewer.

Requirements:

- Create an attractive title.
- Write a clear introduction.
- Use useful headings.
- Explain the subject in simple language.
- Use the research information.
- Address the reviewer feedback.
- Make the article engaging and professional.
- End with a clear conclusion.
- Do not mention that you are an AI.

Return ONLY the revised blog post.
"""

        response = llm.invoke(prompt)

        return {
            "draft": response.content,
            "retry_count": retry_count
        }

    # ======================================
    # FIRST DRAFT
    # ======================================

    print("Writer is creating the first draft...")

    prompt = f"""
You are a professional content writer.

Write a high-quality blog post based on the research below.

TASK:
{task}

RESEARCH:
{research}

Requirements:

- Create an attractive title.
- Write a clear introduction.
- Organize the article with useful headings.
- Explain the subject in simple language.
- Use the research information.
- Make the article engaging and professional.
- End with a clear conclusion.
- Do not mention that you are an AI.

Return ONLY the blog post.
"""

    response = llm.invoke(prompt)

    return {
        "draft": response.content
    }


# ==========================================
# REVIEWER
# ==========================================

def reviewer(state: AgentState):

    print("\n--- REVIEWER ---")

    draft = state["draft"]

    print("Reviewer is checking the blog post...")

    prompt = f"""
You are a professional content reviewer.

Review the following blog post:

{draft}

Check:

- Accuracy
- Clarity
- Organization
- Grammar
- Relevance
- Professional quality

Give brief feedback.

You MUST finish your response with exactly ONE:

DECISION: PASS

or

DECISION: REVISE
"""

    response = llm.invoke(prompt)

    review = response.content

    print("\nReview Result:")
    print(review)

    review_upper = review.upper()

    if "DECISION: REVISE" in review_upper:
        status = "REVISE"

    elif "DECISION: PASS" in review_upper:
        status = "PASS"

    else:
        status = "REVISE"

    print(f"\nReviewer Decision: {status}")

    return {
        "review_feedback": review,
        "review_status": status
    }


# ==========================================
# REVIEW ROUTER
# ==========================================

MAX_RETRIES = 3


def review_router(state: AgentState):

    status = state["review_status"]
    retry_count = state["retry_count"]

    print("\n--- ROUTER ---")
    print(f"Review status: {status}")
    print(f"Retry count: {retry_count}")

    if status == "PASS":

        print("Decision: PASS → PUBLISHER")

        return "pass"

    if retry_count >= MAX_RETRIES:

        print("Maximum retries reached.")
        print("Decision: FORCE → PUBLISHER")

        return "pass"

    print("Decision: REVISE → WRITER")

    return "revise"


# ==========================================
# PUBLISHER
# ==========================================

def publisher(state: AgentState):

    print("\n--- PUBLISHER ---")

    draft = state["draft"]

    print("Publisher is preparing the final article...")

    prompt = f"""
You are a professional publishing editor.

Prepare the following reviewed blog post for final publication.

BLOG POST:

{draft}

Requirements:

- Keep the original meaning.
- Keep the title.
- Keep useful headings.
- Fix obvious grammar or formatting problems.
- Make the article professional and readable.
- Do not add unnecessary commentary.
- Do not mention the review process.
- Return ONLY the final published blog post.
"""

    response = llm.invoke(prompt)

    print("Publisher completed successfully.")

    return {
        "final_output": response.content
    }


# ==========================================
# CREATE GRAPH
# ==========================================

graph = StateGraph(AgentState)


# ==========================================
# ADD NODES
# ==========================================

graph.add_node("manager", manager)
graph.add_node("researcher", researcher)
graph.add_node("writer", writer)
graph.add_node("reviewer", reviewer)
graph.add_node("publisher", publisher)


# ==========================================
# WORKFLOW
# ==========================================

graph.add_edge(START, "manager")
graph.add_edge("manager", "researcher")
graph.add_edge("researcher", "writer")
graph.add_edge("writer", "reviewer")


# ==========================================
# CONDITIONAL ROUTING
# ==========================================

graph.add_conditional_edges(
    "reviewer",
    review_router,
    {
        "pass": "publisher",
        "revise": "writer"
    }
)


# ==========================================
# END
# ==========================================

graph.add_edge("publisher", END)


# ==========================================
# COMPILE
# ==========================================

app = graph.compile()


# ==========================================
# RUN AGENT SYSTEM
# ==========================================

def run_agent(task: str):

    initial_state: AgentState = {

        "task": task,

        "research_notes": "",

        "draft": "",

        "review_feedback": "",

        "final_output": "",

        "review_status": "",

        "retry_count": 0,
    }

    print("\n" + "=" * 60)
    print("MULTI-AGENT SYSTEM STARTED")
    print("=" * 60)

    result = app.invoke(initial_state)

    print("\n" + "=" * 60)
    print("MULTI-AGENT WORKFLOW COMPLETED")
    print("=" * 60)

    return result