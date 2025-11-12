from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from models.detector import Detector
from models.ocr_reader import OcrReader
from utils.image_utils import load_image_from_bytes
from utils.response_format import format_final_output

app = FastAPI(title="EasyOCR API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

yolo_model = Detector(model_path="best.pt", device='cpu')

ocr_reader = OcrReader()


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid image format")

    contents = await file.read()
    image = load_image_from_bytes(contents)
    h, w = image.shape[:2]

    detections = yolo_model.detect(image, w, h)

    texts = ocr_reader.read_boxes(image, detections)
    for det, txt in zip(detections, texts):
        if txt:
            det["text"] = txt
    formatted = format_final_output(detections)
    return JSONResponse(content=formatted)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000)
