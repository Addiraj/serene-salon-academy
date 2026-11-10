import json

db_path = 'data/db.json'
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# 1. Update services with high-resolution imagery
service_images = {
    'srv-facial-signature': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    'srv-hair-cut-advance': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    'srv-hair-spa': '/images/lookbook-hair.jpg',
    'srv-hair-highlights': 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
    'srv-acrylic-perm': '/images/lookbook-nails.jpg',
    'srv-acrylic-ext': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    'srv-manicure-premium': 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    'srv-bridal-hd': '/images/lookbook-bridal.jpg',
    'srv-navratri-festive': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'srv-waxing-rollon': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
}

for s in db.get('services', []):
    if s['id'] in service_images:
        s['image'] = service_images[s['id']]
    elif not s.get('image'):
        s['image'] = '/images/hero-sanctuary.jpg'

# 2. Add users collection if not exists
if 'users' not in db:
    db['users'] = [
        {
            'id': 'usr-101',
            'name': 'Ananya Patel',
            'phone': '+91 9876543210',
            'email': 'ananya.patel@gmail.com',
            'role': 'customer',
            'tier': 'Serene Gold Privilege',
            'loyaltyPoints': 350,
            'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            'createdAt': '2026-10-10'
        },
        {
            'id': 'usr-102',
            'name': 'Rhea Shah',
            'phone': '+91 9123456780',
            'email': 'rhea.shah@gmail.com',
            'role': 'customer',
            'tier': 'Serene Diamond Privilege',
            'loyaltyPoints': 620,
            'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
            'createdAt': '2026-09-01'
        }
    ]

# 3. Add Enrich-style booking promo and captcha config to settings
db['settings']['captchaEnabled'] = True
db['settings']['enrichPromo'] = {
    'headline': 'YOUR FIRST VISIT, YOUR WAY!',
    'subheadline': 'From medical-grade facials to couture bridal makeovers.',
    'womenOffer': 'Women\'s Privileges From ₹549',
    'academyOffer': 'Academy Masterclasses From ₹4,999',
    'ctaText': 'EXPLORE PRIVILEGE OFFERS',
    'bgImage': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80'
}

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

print('Updated data/db.json with services imagery, users collection, and Enrich settings successfully!')

