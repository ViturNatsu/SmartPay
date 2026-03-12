from flask import Flask, request
import subprocess
import os

app = Flask(__name__)

@app.route("/", methods=["GET","POST"])
def trigger():
    if request.method == "POST":
        data = request.json

        # only merge request events
        if data.get("object_kind") != "merge_request":
            return "Ignored", 200

        # only when MR targets develop
        target = data["object_attributes"]["target_branch"]

        if target != "develop":
            return "Ignored - not develop", 200

        subprocess.run([
            "gcloud","run","jobs","execute","gitlab-runner","--region","us-central1"
        ])

        return "Runner job started", 200

    return "Service alive", 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)