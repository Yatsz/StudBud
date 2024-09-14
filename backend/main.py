from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
import os
import requests
from dotenv import load_dotenv
import logging
from agent import agent, InitiateChitChatDialogue, ChitChatDialogueMessage


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI()

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg"}
# BASETEN_WHISPER_KEY = os.environ["BASETEN_WHISPER_KEY"]
# BASETEN_WHISPER_KEY = "zuovp9Vj.7XLa7MeT8JaRbOd0PZsoyaza9wO58JuU"
# BASETEN_WHISPER_KEY = os.getenv("enCYVmG99K.hm0pgdkqvIGJJ4RPjeB4X1Osn0Er9Dcd")
BASETEN_WHISPER_KEY = os.getenv("BASETEN_WHISPER_KEY")
BASETEN_MODEL_URL = "https://model-7wlmmd7q.api.baseten.co/production/async_predict"


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.post("/dialogue")
async def dialogue(request: Request):
    try:
        payload = await request.json()
        user_message = payload.get("message")
        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Process the message using the agent
        response = await agent.process_message(user_message)
        return JSONResponse(content={"response": response})
    except Exception as e:
        logger.error(f"Error processing dialogue: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    logger.info(f"Received file upload: {file.filename}")

    if not allowed_file(file.filename):
        logger.warning(f"File type not allowed: {file.filename}")
        raise HTTPException(status_code=400, detail="File type not allowed")

    # add s3 upload

    data = {
        "url": "https://drive.google.com/file/d/1lJ_iwBWbBI5S9dLbOzkLGysoyYckMw-5/view?usp=drive_link"
    }

    # Send async request to Baseten Whisper model
    try:
        logger.info(f"Sending async request to Baseten Whisper model for URL")
        resp = requests.post(
            "https://model-7wlmmd7q.api.baseten.co/production/predict",
            headers={"Authorization": f"Api-Key {BASETEN_WHISPER_KEY}"},
            json={"url": "https://cdn.baseten.co/docs/production/Gettysburg.mp3"},
        )
        resp.raise_for_status()
        result = resp.json()
        request_id = result.get("request_id")
        logger.info(f"response:{result}, request_id: {request_id}")

        return JSONResponse(content={"result": result})
    except requests.RequestException as e:
        logger.error(f"Error sending async request for file {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error sending async request: {str(e)}"
        )


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
