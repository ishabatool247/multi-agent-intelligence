from django.contrib import admin
from django.urls import path

from api.views import (
    run_agent_api,
    health_api,
    history_api,
    delete_history_api,
    clear_history_api,
)

urlpatterns = [

    path("admin/", admin.site.urls),

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
]