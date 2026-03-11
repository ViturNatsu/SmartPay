import functions_framework
from google.cloud import run_v2

PROJECT_ID = "project-2d0e67c2-234f-46f1-8d5"
REGION = "us-central1"
JOB_NAME = "gitlab-ci-runner"

@functions_framework.http
def trigger(request):

    client = run_v2.JobsClient()

    job_path = client.job_path(PROJECT_ID, REGION, JOB_NAME)

    operation = client.run_job(name=job_path)

    return "Job started", 200