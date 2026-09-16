from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from main import run_agent
from .models import WorkflowExecution


@api_view(["GET"])
def health_api(request):
    return Response(
        {
            "success": True,
            "status": "online",
            "service": "Multi-Agent Intelligence API",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def run_agent_api(request):
    task = request.data.get("task", "").strip()

    if not task:
        return Response(
            {"error": "Task is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        result = run_agent(task)

        WorkflowExecution.objects.create(
            task=task,
            research_notes=result.get("research_notes", ""),
            draft=result.get("draft", ""),
            review_feedback=result.get("review_feedback", ""),
            review_status=result.get("review_status", ""),
            retry_count=result.get("retry_count", 0),
            final_output=result.get("final_output", ""),
        )

        return Response(
            {
                "success": True,
                "task": task,
                "research_notes": result.get("research_notes", ""),
                "draft": result.get("draft", ""),
                "review_feedback": result.get("review_feedback", ""),
                "review_status": result.get("review_status", ""),
                "retry_count": result.get("retry_count", 0),
                "final_output": result.get("final_output", ""),
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def history_api(request):
    executions = WorkflowExecution.objects.all().order_by("-created_at")

    data = []

    for execution in executions:
        data.append(
            {
                "id": execution.id,
                "task": execution.task,
                "research_notes": execution.research_notes,
                "draft": execution.draft,
                "review_feedback": execution.review_feedback,
                "review_status": execution.review_status,
                "retry_count": execution.retry_count,
                "final_output": execution.final_output,
                "created_at": execution.created_at,
            }
        )

    return Response(
        {
            "success": True,
            "executions": data,
        },
        status=status.HTTP_200_OK
    )
@api_view(["DELETE"])
def delete_history_api(request, execution_id):
    try:
        execution = WorkflowExecution.objects.get(id=execution_id)
        execution.delete()

        return Response(
            {
                "success": True,
                "message": "Execution deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )

    except WorkflowExecution.DoesNotExist:
        return Response(
            {
                "success": False,
                "error": "Execution not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["DELETE"])
def clear_history_api(request):
    deleted_count, _ = WorkflowExecution.objects.all().delete()

    return Response(
        {
            "success": True,
            "message": "Execution history cleared successfully.",
            "deleted_count": deleted_count,
        },
        status=status.HTTP_200_OK,
    )