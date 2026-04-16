from PIL import Image
import os

img_path = r'C:/Users/HareneeS/.gemini/antigravity/brain/5ae20a1b-65e1-4620-aa2d-6137d928b794/uploaded_media_1776325689992.png'
save_dir = r'c:\Users\HareneeS\Desktop\Meal_planner\public\categories'

os.makedirs(save_dir, exist_ok=True)
img = Image.open(img_path)
img = img.convert("RGB")
width, height = img.size
print("Size:", width, "x", height)

# Usually width is 731. Let's dynamically calculate assuming 4 columns.
# We skip the crop of row 0 since we already have it (drinks, icecream, chips, choco)
# or we can just extract all 12 and overwrite row 0 to be perfect!

# Let's find centers dynamically or hardcode for similar aspect ratio.
# If it's a 3x4 grid for this specific region, with header at top:
# Center x is same: 110, 280, 450, 620
# Center y for first row: 170
# Center y for second row: 490
# Center y for third row: 810
# So spacing is roughly 320px
# Let's write a generic loop. 

# If width is proportional:
col_w = width / 4
cx = [int(col_w * 0.5), int(col_w * 1.5), int(col_w * 2.5), int(col_w * 3.5)]

# Row heights usually start after header (~100px), then squares are ~150px, gap ~150.
# Assuming standard 1024 height screenshot:
cy = [170, 500, 830]

names = [
    # row 0
    'drinks', 'icecream', 'chips', 'choco',
    # row 1
    'biscuits', 'teacoffee', 'sauces', 'sweets',
    # row 2
    'noodles', 'frozen', 'dryfruits', 'paan'
]

idx = 0
for row_idx in range(3):
    for col_idx in range(4):
        # We know from screenshot spacing is identical.
        c_x = cx[col_idx]
        c_y = cy[row_idx]
        
        # Bounding box of 150x150
        left = c_x - 75
        upper = c_y - 75
        right = c_x + 75
        lower = c_y + 75
        
        crop = img.crop((left, upper, right, lower))
        save_path = os.path.join(save_dir, f"{names[idx]}.jpg")
        crop.save(save_path, "JPEG", quality=90)
        idx += 1

print("Slicing complete for snacks!")
