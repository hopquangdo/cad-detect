from paddleocr import PaddleOCR
import cv2
import numpy as np
import os


class OcrReader:
    def __init__(self, save_dir="outputs/crops"):
        self.reader = PaddleOCR(
            use_angle_cls=False,
            lang='en'
        )
        self._counter = 0
        self.save_dir = save_dir
        os.makedirs(self.save_dir, exist_ok=True)  # Tạo thư mục lưu crop nếu chưa có

    def remove_white_border(self, img, threshold=240):
        """
        Loại bỏ viền trắng xung quanh ảnh.
        threshold: giá trị ngưỡng (0–255), càng nhỏ càng nhạy.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY_INV)
        coords = cv2.findNonZero(thresh)

        if coords is not None:
            x, y, w, h = cv2.boundingRect(coords)
            return img[y:y + h, x:x + w]
        else:
            return img  # nếu toàn trắng, trả lại nguyên ảnh

    def read_boxes(self, image, boxes, target_size=256, save_each_crop=True):
        crops = []
        valid_indices = []

        for i, box in enumerate(boxes):
            x, y, w, h = box["x"], box["y"], box["width"], box["height"]
            crop = image[y:y + h, x:x + w]

            if crop.size == 0:
                continue

            # --- Cắt viền trắng trước khi resize ---
            crop_no_border = self.remove_white_border(crop, threshold=240)

            # --- Lưu ảnh crop --

            # --- Resize ảnh để OCR ---
            crop_resized = cv2.resize(crop_no_border, (target_size, target_size), interpolation=cv2.INTER_CUBIC)

            if save_each_crop:
                self._counter += 1
                save_path = os.path.join(self.save_dir, f"box_{self._counter:04d}.jpg")
                cv2.imwrite(save_path, crop_resized)
                print(f"📁 Saved: {save_path}")

            crops.append(crop_resized)
            valid_indices.append(i)

        if not crops:
            return [None] * len(boxes)

        # Dự đoán bằng PaddleOCR
        results = self.reader.predict(crops)

        output_texts = [None] * len(boxes)
        for idx, res in zip(valid_indices, results):
            texts = res.get("rec_texts", [])
            result_text = "-".join(text.strip() for text in texts if text.strip())
            output_texts[int(idx)] = result_text

        return output_texts
