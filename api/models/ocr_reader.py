from paddleocr import PaddleOCR
import cv2


class OcrReader:
    def __init__(self):
        self.reader = PaddleOCR(
            use_angle_cls=False,
            lang='en'
        )
        self._counter = 0

    def read_boxes(self, image, boxes, min_size=128):
        crops = []
        valid_indices = []
        for i, box in enumerate(boxes):
            x, y, w, h = box["x"], box["y"], box["width"], box["height"]
            crop = image[y:y+h, x:x+w]
            if crop.size == 0:
                continue
            h_crop, w_crop = crop.shape[:2]
            scale = max(min_size / h_crop, min_size / w_crop, 1)
            if scale > 1:
                crop = cv2.resize(crop, (int(w_crop*scale), int(h_crop*scale)), interpolation=cv2.INTER_CUBIC)
            crops.append(crop)
            valid_indices.append(i)

        if not crops:
            return [None] * len(boxes)

        results = self.reader.predict(crops)

        output_texts = [None] * len(boxes)
        for idx, res in zip(valid_indices, results):
            texts = res.get("rec_texts", [])
            result_text = "-".join(text.strip() for text in texts if text.strip())
            output_texts[int(idx)] = result_text
        return output_texts
