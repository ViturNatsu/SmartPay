import logging
import os
import subprocess

from flask import Flask, request

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
LOGGER = logging.getLogger(__name__)
RUNNER_JOB_NAME = os.environ["RUNNER_JOB_NAME"]
RUNNER_REGION = os.environ["RUNNER_REGION"]


def _payload_metadata(data):
    object_attributes = data.get("object_attributes", {}) if isinstance(data, dict) else {}
    last_commit = data.get("last_commit", {}) if isinstance(data, dict) else {}

    return {
        "object_kind": data.get("object_kind"),
        "mr_iid": object_attributes.get("iid"),
        "source_branch": object_attributes.get("source_branch"),
        "target_branch": object_attributes.get("target_branch"),
        "sha": last_commit.get("id") or object_attributes.get("last_commit", {}).get("id"),
    }


def _log_webhook_received(metadata):
    LOGGER.info(
        "Webhook received object_kind=%s mr_iid=%s source_branch=%s target_branch=%s sha=%s",
        metadata["object_kind"],
        metadata["mr_iid"],
        metadata["source_branch"],
        metadata["target_branch"],
        metadata["sha"],
    )


def _launch_runner_job(metadata):
    command = ["gcloud", "run", "jobs", "execute", RUNNER_JOB_NAME, "--region", RUNNER_REGION]

    LOGGER.info(
        "Launching runner job for mr_iid=%s target_branch=%s sha=%s",
        metadata["mr_iid"],
        metadata["target_branch"],
        metadata["sha"],
    )

    result = subprocess.run(command, capture_output=True, text=True)

    LOGGER.info(
        "Runner launch finished returncode=%s stdout=%s stderr=%s",
        result.returncode,
        result.stdout.strip(),
        result.stderr.strip(),
    )

    return result


@app.route("/", methods=["GET","POST"])
def trigger():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        metadata = _payload_metadata(data)

        _log_webhook_received(metadata)

        # only merge request events
        if data.get("object_kind") != "merge_request":
            LOGGER.info("Ignoring webhook: object_kind=%s is not merge_request", metadata["object_kind"])
            return "Ignored - not merge_request", 200

        # only when MR targets develop
        target = metadata["target_branch"]

        if target != "develop":
            LOGGER.info("Ignoring webhook: target branch %s is not develop", target)
            return "Ignored - not develop", 200

        result = _launch_runner_job(metadata)

        if result.returncode != 0:
            return "Runner job failed to start", 500

        return "Runner job started", 200

    LOGGER.info("Health check received")
    return "Service alive", 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
