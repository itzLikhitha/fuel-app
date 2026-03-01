import base64
import io
import re

import cv2
import easyocr
import numpy as np
from PIL import Image

# Initialize the EasyOCR reader once at module load to avoid repeated heavy setup.
# English-only model as requested.
READER = easyocr.Reader(["en"], gpu=False)


def extract_plate_text(base64_image):
    """
    Extract and normalize number plate text from a base64-encoded image.

    Steps:
    1. Remove optional data URL header.
    2. Decode base64 image bytes.
    3. Load into PIL and convert to RGB.
    4. Convert to numpy array and then to OpenCV BGR image.
    5. Run EasyOCR to detect text.
    6. Merge detected text and clean it.
    7. Return uppercase alphanumeric text, or None if no text is detected.
    """
    if not base64_image or not isinstance(base64_image, str):
        return None

    # Remove data URL header if present (e.g., data:image/png;base64,)
    image_b64 = re.sub(r"^data:image/[^;]+;base64,", "", base64_image.strip(), flags=re.IGNORECASE)

    try:
        # Decode base64 to bytes
        image_bytes = base64.b64decode(image_b64)

        # Open with PIL for robust image decoding
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Convert PIL image to numpy array (RGB)
        rgb_array = np.array(pil_image)

        # Convert RGB to OpenCV BGR format
        bgr_image = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
    except Exception:
        return None

    # Run OCR and collect text segments
    results = READER.readtext(bgr_image)
    if not results:
        return None

    detected_text_parts = [item[1] for item in results if len(item) > 1 and item[1]]
    if not detected_text_parts:
        return None

    # Merge and clean text: remove spaces/special chars, keep only A-Z and 0-9
    raw_text = "".join(detected_text_parts)
    cleaned_text = re.sub(r"[^A-Za-z0-9]", "", raw_text).upper()

    return cleaned_text or None
