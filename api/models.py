from django.db import models


class WorkflowExecution(models.Model):
    task = models.TextField()
    research_notes = models.TextField(blank=True)
    draft = models.TextField(blank=True)
    review_feedback = models.TextField(blank=True)
    review_status = models.CharField(max_length=20, blank=True)
    retry_count = models.IntegerField(default=0)
    final_output = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.task[:80]