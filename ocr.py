import pytesseract
from PIL import Image

im = Image.open('/img/media_1791998723914.png')
w, h = im.size
# Crop around the error text
card = im.crop((int(w * 0.45), int(h * 0.50), int(w * 0.65), int(h * 0.62)))
card.save('/img/card_cropped.png')
txt = pytesseract.image_to_string(card)
print('ERROR TEXT IS: [' + txt.strip() + ']')
