from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import os
import io
import base64
from dotenv import load_dotenv
import logging
import boto3
import uuid
from datetime import datetime

# from agent import agent, InitiateChitChatDialogue, ChitChatDialogueMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg"}
# BASETEN_WHISPER_KEY = os.environ["BASETEN_WHISPER_KEY"]
BASETEN_WHISPER_KEY = "zuovp9Vj.7XLa7MeT8JaRbOd0PZsoyaza9wO58JuU"
# BASETEN_WHISPER_KEY = os.getenv("enCYVmG99K.hm0pgdkqvIGJJ4RPjeB4X1Osn0Er9Dcd")

load_dotenv()

# BASETEN_WHISPER_KEY = os.getenv("BASETEN_WHISPER_KEY")
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
    BASETEN_MODEL_URL = "https://model-7wlmmd7q.api.baseten.co/production/predict"
    logger.info(f"Received file upload: {file.filename}")

    if not allowed_file(file.filename):
        logger.warning(f"File type not allowed: {file.filename}")
        raise HTTPException(status_code=400, detail="File type not allowed")

    # Generate a unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{file_extension}"

    # Upload file to S3
    try:
        s3_client = boto3.client("s3")
        s3_key = f"uploads/{unique_filename}"

        # Read the file content
        file_content = await file.read()

        # Upload to S3
        s3_client.put_object(Body=file_content, Bucket=S3_BUCKET_NAME, Key=s3_key)

        s3_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET_NAME, "Key": s3_key},
            ExpiresIn=3600,
        )
        logger.info(f"File uploaded to S3: {s3_url}")
    except Exception as e:
        logger.error(f"Error uploading file to S3: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error uploading file to S3: {str(e)}"
        )

    # Send async request to Baseten Whisper model
    try:
        logger.info(f"Sending request to Baseten Whisper model for S3 URL")
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
        logger.error(f"Error sending  request for file {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending  request: {str(e)}")


system_prompt = """
You are a helpful teaching assitant helping middle school children with their homework assignments however you can never provide an answer. You can only guide the child towards the answer.

Given a math problem below:
"""


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
                    {"role": "system", "content": {system_prompt}},
                    {
                        "role": "user",
                        "content": transcription
                        + "Answer the latest question at last most recent row",
                    },
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


@app.post("/text_to_voice")
async def text_to_voice(request: Request):
    BASETEN_BARK_URL = "https://model-03y55yvw.api.baseten.co/production/predict"  # Replace with your actual model ID

    def wav_to_base64(file_path):
        with open(file_path, "rb") as wav_file:
            binary_data = wav_file.read()
            base64_data = base64.b64encode(binary_data)
            base64_string = base64_data.decode("utf-8")
            return base64_string

    try:
        payload = await request.json()
        prompt = payload.get("prompt")
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")

        voice = wav_to_base64("icebear_cut.wav")

        text = prompt
        data = {"text": text, "speaker_voice": voice, "language": "en"}

        logger.info(f"Sending text-to-voice request to Baseten Bark model")
        resp = requests.post(
            BASETEN_BARK_URL,
            headers={"Authorization": f"Api-Key {BASETEN_WHISPER_KEY}"},
            json=data,
        )
        resp.raise_for_status()
        result = resp.json()

        audio_output = result.get("output")
        if not audio_output:
            raise HTTPException(
                status_code=500, detail="No output received from the model"
            )

        return JSONResponse(
            content={"audio_output": audio_output},
            headers={"Content-Type": "application/json"},
        )
    except requests.RequestException as e:
        logger.error(f"Error sending text-to-voice request: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error sending text-to-voice request: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing text-to-voice: {str(e)}")
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
