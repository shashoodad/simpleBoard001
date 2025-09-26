import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.test import Client
import json
client = Client(HTTP_HOST='127.0.0.1')
response = client.post('/api/auth/login/', data=json.dumps({'email':'admin@shashoo.com','password':'Admin!234'}), content_type='application/json')
print('login', response.status_code)
data = response.json()
client.defaults['HTTP_AUTHORIZATION'] = f"Bearer {data['access']}"
board_resp = client.get('/api/boards', HTTP_HOST='127.0.0.1')
print('boards', board_resp.status_code)
print(board_resp.content[:200])
post_resp = client.post('/api/boards/1/posts/', data=json.dumps({'title':'테스트','content':'내용','view_type':'card'}), content_type='application/json', HTTP_HOST='127.0.0.1')
print('post', post_resp.status_code)
print(post_resp.content[:200])
