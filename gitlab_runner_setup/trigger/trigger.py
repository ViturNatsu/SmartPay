from flask import Flask, request
import subprocess
import os   # <-- missing import

app = Flask(__name__)

@app.route("/", methods=["GET","POST"])
def trigger():
    if request.method == "POST":
        subprocess.run([
            "gcloud","run","jobs","execute","gitlab-runner","--region","us-central1"
        ])
        return "Job started", 200

    return "Service alive", 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)