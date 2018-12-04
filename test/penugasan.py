from uuid import uuid4

with open('/media/soedomoto/DATA/PROJECT/2018-bps-performa-360/www-v2.1/archives/20180713_Kabkot.csv', 'r') as f:
    lines = f.readlines()
    lines = [l.strip().split(',') for l in lines]
    lines = ['INSERT INTO `v2_office_unit`(`id`, `id_province`, `id_regency`, `name`) VALUES("{}", "{}", "{}", "{}");'.format(uuid4(), b, c, d) for (a, b, c, d) in lines[1:]]
    print('\n'.join(lines))


# import requests
#
# r = requests.get('https://simpeg.bps.go.id/360/api/v2/summary/response_by_echelon2/session/70de7591-9234-4197-ab48-98542546e11c')
# resp = r.json()
# if resp['success']:
#     data = resp['data']
#     for u in data:
#         if int(u['total']) > int(u['blank']) + int(u['complete']) + int(u['uncomplete']):
#             print(u)
#
#             r2 = requests.get('https://simpeg.bps.go.id/360/api/v2/assessment/rated/rater/{}/session/70de7591-9234-4197-ab48-98542546e11c/reset/true'.format(u['nip']))
#             print('Success' if resp['success'] else 'Failed')