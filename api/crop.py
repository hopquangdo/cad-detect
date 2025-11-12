import cv2
import numpy as np
import os

def remove_outer_circle(image_path, save_path="outputs/cleaned.jpg"):
    # Đọc ảnh
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Làm mượt nhẹ để giảm nhiễu
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Tìm cạnh
    edges = cv2.Canny(blurred, 50, 256)

    # Tìm đường tròn bằng Hough
    circles = cv2.HoughCircles(
        edges,
        cv2.HOUGH_GRADIENT,
        dp=1,
        minDist=100,
        param1=100,
        param2=30,
        minRadius=80,
        maxRadius=300
    )

    if circles is None:
        print("❌ Không phát hiện được đường tròn.")
        return img

    # Lấy đường tròn lớn nhất (bao quanh toàn bộ)
    circles = np.uint16(np.around(circles))
    largest = max(circles[0, :], key=lambda c: c[2])
    x, y, r = largest

    # Tạo mask trắng rồi vẽ vòng tròn đen để xóa
    mask = np.ones_like(gray) * 255
    cv2.circle(mask, (x, y), r - 1, 0, 3)

    # Dùng mask để xóa đường tròn
    cleaned = img.copy()
    cleaned[mask == 0] = [255, 255, 255]  # thay phần vòng tròn bằng nền trắng

    # Làm mịn và khôi phục nét chữ
    gray_clean = cv2.cvtColor(cleaned, cv2.COLOR_BGR2GRAY)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    closed = cv2.morphologyEx(gray_clean, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Trộn lại để tạo ảnh cuối cùng
    final = cv2.cvtColor(closed, cv2.COLOR_GRAY2BGR)

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    cv2.imwrite(save_path, final)
    print(f"✅ Ảnh sau khi xóa đường tròn đã lưu tại: {save_path}")

    return final


# --- Ví dụ sử dụng ---
if __name__ == "__main__":
    out = remove_outer_circle("outputs/crops/box_0001.jpg")
    cv2.imshow("Result", out)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
