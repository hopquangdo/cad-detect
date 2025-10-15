def format_final_output(detections):
    # chỉ giữ các trường theo yêu cầu
    return [
        {
            "id": det["id"],
            "name": det.get("text", det["name"]),
            "x": det["x"],
            "y": det["y"],
            "width": det["width"],
            "height": det["height"],
            "confidence": det["confidence"]
        }
        for det in detections
    ]
