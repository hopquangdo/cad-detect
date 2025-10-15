import cv2
import numpy as np

def load_image_from_bytes(file_bytes):
    np_img = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Cannot decode image")
    return img

def clamp_xyxy(x1, y1, x2, y2, img_w, img_h):
    x1 = max(0, min(img_w - 1, int(round(x1))))
    y1 = max(0, min(img_h - 1, int(round(y1))))
    x2 = max(0, min(img_w - 1, int(round(x2))))
    y2 = max(0, min(img_h - 1, int(round(y2))))
    return x1, y1, x2, y2

def xywhn_to_xyxy_pixels(xc, yc, w, h, img_w, img_h):
    x_center = xc * img_w
    y_center = yc * img_h
    bw = w * img_w
    bh = h * img_h
    x1 = x_center - bw / 2.0
    y1 = y_center - bh / 2.0
    x2 = x_center + bw / 2.0
    y2 = y_center + bh / 2.0
    return clamp_xyxy(x1, y1, x2, y2, img_w, img_h)
