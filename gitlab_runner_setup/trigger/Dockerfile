FROM python:3.11

RUN apt-get update && apt-get install -y curl

RUN curl -sSL https://sdk.cloud.google.com | bash

ENV PATH=$PATH:/root/google-cloud-sdk/bin

WORKDIR /app
COPY trigger.py .

RUN pip install flask

CMD ["python", "trigger.py"]