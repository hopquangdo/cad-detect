from ultralytics import YOLO
from utils.image_utils import clamp_xyxy


class YoloDetector:
    def __init__(self, model_path="best.pt", device='cpu'):
        self.device = device
        self.model = YOLO(model_path)
        self.model.fuse()
        self.model.to(self.device)

    @staticmethod
    def get_imagesize(orig_w, orig_h, max_size=4768, min_size=320):
        max_dim = max(orig_w, orig_h)

        scale = max_size / max_dim if max_dim > max_size else 1.0

        imgsz_w = int(orig_w * scale)
        imgsz_h = int(orig_h * scale)

        imgsz_w = max(min_size, (imgsz_w + 31) // 32 * 32)
        imgsz_h = max(min_size, (imgsz_h + 31) // 32 * 32)

        imgsz = max(imgsz_w, imgsz_h)
        return imgsz

    def detect(self, img, orig_w, orig_h):
        imagesize = YoloDetector.get_imagesize(orig_w, orig_h)
        results = self.model.predict(
            source=img, imgsz=imagesize,
            device=self.device, verbose=True,
            save=False, conf=0.1)

        if len(results) == 0:
            print("No results returned from YOLO model.")
            return []

        res = results[0]
        xyxy = res.boxes.xyxy.cpu().numpy()
        confs = res.boxes.conf.cpu().numpy()
        classes = res.boxes.cls.cpu().numpy()
        names = res.names if hasattr(res, "names") else {}

        print(f"Detected {len(xyxy)} objects")

        boxes_1 = []
        boxes_0 = []

        for i, b in enumerate(xyxy):
            x1, y1, x2, y2 = clamp_xyxy(*b.tolist(), orig_w, orig_h)
            box_info = {
                "id": str(i + 1),
                "name": names.get(int(classes[i]), f"class_{int(classes[i])}"),
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1,
                "x2": x2,
                "y2": y2,
                "confidence": round(float(confs[i]), 3)
            }
            if int(classes[i]) == 1:
                boxes_1.append(box_info)
            elif int(classes[i]) == 0:
                boxes_0.append(box_info)

        def overlaps(box_a, box_b):
            return not (box_a["x2"] < box_b["x"] or box_a["x"] > box_b["x2"] or
                        box_a["y2"] < box_b["y"] or box_a["y"] > box_b["y2"])

        filtered_boxes_0 = [b for b in boxes_0 if not any(overlaps(b, b1) for b1 in boxes_1)]

        final_boxes = filtered_boxes_0

        for b in final_boxes:
            b.pop("x2", None)
            b.pop("y2", None)
            print(f"Final box: {b}")

        print("Detection finished with filtering.")
        return final_boxes
