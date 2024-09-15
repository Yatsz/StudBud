from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
import requests
import os
from dotenv import load_dotenv
import logging
import boto3

# from agent import agent, InitiateChitChatDialogue, ChitChatDialogueMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg"}
# BASETEN_WHISPER_KEY = os.environ["BASETEN_WHISPER_KEY"]
BASETEN_WHISPER_KEY = "zuovp9Vj.7XLa7MeT8JaRbOd0PZsoyaza9wO58JuU"
# BASETEN_WHISPER_KEY = os.getenv("enCYVmG99K.hm0pgdkqvIGJJ4RPjeB4X1Osn0Er9Dcd")

load_dotenv()

# BASETEN_WHISPER_KEY = os.getenv("BASETEN_WHISPER_KEY")
BASETEN_MODEL_URL = "https://model-7wlmmd7q.api.baseten.co/production/predict"
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# @app.post("/dialogue")
# async def dialogue(request: Request):
#     try:
#         payload = await request.json()
#         user_message = payload.get("message")
#         if not user_message:
#             raise HTTPException(status_code=400, detail="Message is required")

#         # Process the message using the agent
#         response = await agent.process_message(user_message)
#         return JSONResponse(content={"response": response})
#     except Exception as e:
#         logger.error(f"Error processing dialogue: {str(e)}")
#         return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    logger.info(f"Received file upload: {file.filename}")

    if not allowed_file(file.filename):
        logger.warning(f"File type not allowed: {file.filename}")
        raise HTTPException(status_code=400, detail="File type not allowed")

    # Upload file to S3
    try:
        s3_client = boto3.client("s3")
        s3_key = f"uploads/{file.filename}"

        # Read the file content
        file_content = await file.read()

        # Upload to S3
        s3_client.put_object(Body=file_content, Bucket=S3_BUCKET_NAME, Key=s3_key)

        s3_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
        logger.info(f"File uploaded to S3: {s3_url}")
    except Exception as e:
        logger.error(f"Error uploading file to S3: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error uploading file to S3: {str(e)}"
        )

    # Send async request to Baseten Whisper model
    try:
        logger.info(f"Sending async request to Baseten Whisper model for S3 URL")
        resp = requests.post(
            BASETEN_MODEL_URL,
            headers={"Authorization": f"Api-Key {BASETEN_WHISPER_KEY}"},
            json={"url": s3_url},
        )
        resp.raise_for_status()
        result = resp.json()
        request_id = result.get("request_id")
        logger.info(f"response:{result}, request_id: {request_id}")

        return JSONResponse(content={"result": result})  # , "s3_url": s3_url})
    except requests.RequestException as e:
        logger.error(f"Error sending async request for file {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error sending async request: {str(e)}"
        )


@app.post("/assess")
async def assess_transcription(request: Request):
    BASETEN_LLM_URL = "https://model-2qj00lgw.api.baseten.co/production/predict"
    try:
        payload = await request.json()
        transcription = payload.get("transcription")
        if not transcription:
            raise HTTPException(status_code=400, detail="Transcription is required")

        logger.info(f"Sending assessment request to Baseten LLM model")
        resp = requests.post(
            BASETEN_LLM_URL,
            headers={"Authorization": f"Api-Key {BASETEN_WHISPER_KEY}"},
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"You are a teacher, provide feedback to student on the following transcription: {transcription}",
                            },
                        ],
                    }
                ],
                "stream": False,
            },
        )
        resp.raise_for_status()
        result = resp.json()

        assessment = result["choices"][0]["message"]["content"]
        logger.info(f"Assessment result: {assessment}")

        return JSONResponse(content={"assessment": assessment})
    except requests.RequestException as e:
        logger.error(f"Error sending assessment request: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error sending assessment request: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing assessment: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/webhook")
async def webhook(request: Request):
    try:
        payload = await request.json()
        logger.info(f"Received webhook payload: {payload}")

        # Process the payload as needed
        request_id = payload.get("request_id")
        transcription = payload.get("data", {}).get("transcription", "")
        errors = payload.get("errors", [])

        if errors:
            logger.error(f"Errors in async request {request_id}: {errors}")
            return JSONResponse(status_code=500, content={"errors": errors})

        # Save or process the transcription as needed
        logger.info(f"Transcription for request {request_id}: {transcription}")
        return JSONResponse(content={"transcription": transcription})
    except Exception as e:
        logger.error(f"Error processing webhook payload: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
