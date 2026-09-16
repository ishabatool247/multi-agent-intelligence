from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView

from api.views import (
    run_agent_api,
    health_api,
    history_api,
    delete_history_api,
    clear_history_api,
)


urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # API Endpoints
    path(
        "api/run-agent/",
        run_agent_api,
        name="run_agent_api",
    ),

    path(
        "api/health/",
        health_api,
        name="health_api",
    ),

    path(
        "api/history/",
        history_api,
        name="history_api",
    ),

    path(
        "api/history/<int:execution_id>/",
        delete_history_api,
        name="delete_history_api",
    ),

    path(
        "api/history/clear/",
        clear_history_api,
        name="clear_history_api",
    ),

    # React Frontend
    re_path(
        r"^(?!api/|admin/).*",
        TemplateView.as_view(template_name="index.html"),
        name="frontend",
    ),
]