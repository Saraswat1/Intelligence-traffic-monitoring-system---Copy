import cv2
import imutils
import numpy as np
import pytesseract
import sqlite3

# Initialize SQLite database
conn = sqlite3.connect("fines.db")
cursor = conn.cursor()
cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_fines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_plate TEXT NOT NULL
    )
""")
conn.commit()

# Initialize the camera
cap = cv2.VideoCapture(0)  # 0 for default camera
if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

print("Press 's' to capture an image of the vehicle.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    cv2.imshow("Press 's' to Capture", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("s"):
        cv2.imwrite("captured_vehicle.jpg", frame)
        print("Image Captured!")
        break
    elif key == ord("q"):
        print("Exiting...")
        cap.release()
        cv2.destroyAllWindows()
        exit()

cap.release()
cv2.destroyAllWindows()

# Load the captured image
img = cv2.imread("captured_vehicle.jpg", cv2.IMREAD_COLOR)
img = cv2.resize(img, (600, 400))

# Convert to grayscale and apply filtering
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray = cv2.bilateralFilter(gray, 13, 15, 15)

# Detect edges
edged = cv2.Canny(gray, 30, 200)
contours = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
contours = imutils.grab_contours(contours)
contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
screenCnt = None

# Find the license plate contour
for c in contours:
    peri = cv2.arcLength(c, True)
    approx = cv2.approxPolyDP(c, 0.018 * peri, True)
    if len(approx) == 4:
        screenCnt = approx
        break

if screenCnt is None:
    print("No contour detected")
else:
    cv2.drawContours(img, [screenCnt], -1, (0, 0, 255), 3)

# Extract the plate region
mask = np.zeros(gray.shape, np.uint8)
new_image = cv2.drawContours(mask, [screenCnt], 0, 255, -1)
new_image = cv2.bitwise_and(img, img, mask=mask)

(x, y) = np.where(mask == 255)
(topx, topy) = (np.min(x), np.min(y))
(bottomx, bottomy) = (np.max(x), np.max(y))
Cropped = gray[topx:bottomx+1, topy:bottomy+1]

# OCR Processing
text = pytesseract.image_to_string(Cropped, config='--psm 11')
text = text.strip().replace("\n", "").replace(" ", "")  # Clean up OCR output
print("Detected License Plate Number:", text)

# Save to database
if text:
    cursor.execute("INSERT INTO vehicle_fines (license_plate) VALUES (?)", (text,))
    conn.commit()
    print("License Plate Number saved to database!")

# Show the images
cv2.imshow("Captured Vehicle", img)
cv2.imshow("Cropped Plate", Cropped)
cv2.imshow("Processed Image", gray)
cv2.imshow("Edges", edged)

cv2.waitKey(0)
cv2.destroyAllWindows()
conn.close()  