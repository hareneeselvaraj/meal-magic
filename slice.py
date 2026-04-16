from PIL import Image
import os

img_path = r'C:\Users\HareneeS\.gemini\antigravity\brain\5ae20a1b-65e1-4620-aa2d-6137d928b794\media__1776325034527.png'
save_dir = r'c:\Users\HareneeS\Desktop\Meal_planner\public\categories'

os.makedirs(save_dir, exist_ok=True)
img = Image.open(img_path)
img = img.convert("RGB")
width, height = img.size

# The image is 731 x 1024.
# After visual inspection, the categories are laid out in a 3x4 grid.
# Row y-centers approximate: 130, 480, 840
# Col x-centers approximate: 105, 275, 445, 615
# We extract 150x150 squares around these centers.

centers = [
    [(110, 150), (280, 150), (450, 150), (620, 150)],
    [(110, 490), (280, 490), (450, 490), (620, 490)],
    [(110, 830), (280, 830), (450, 830), (620, 830)]
]

names = [
    'veg', 'fruits', 'dairy', 'meat',
    'rice', 'masalas', 'oils', 'cereals',
    'drinks', 'icecream', 'chips', 'choco'
]

idx = 0
for row_idx in range(3):
    for col_idx in range(4):
        cx, cy = centers[row_idx][col_idx]
        # Bounding box
        left = cx - 75
        upper = cy - 75
        right = cx + 75
        lower = cy + 75
        
        # Crop
        crop = img.crop((left, upper, right, lower))
        
        # Ensure pure white corners if needed? Let's just save the crop exactly!
        # Because we'll apply mix-blend-multiply in CSS!
        save_path = os.path.join(save_dir, f"{names[idx]}.jpg")
        crop.save(save_path, "JPEG", quality=90)
        print(f"Saved {names[idx]}")
        idx += 1

print("Slicing complete!")
