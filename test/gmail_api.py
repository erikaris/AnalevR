from __future__ import print_function
import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools

# Setup the Gmail API
SCOPES = 'https://www.googleapis.com/auth/gmail.compose'
store = file.Storage('gmail_credential_compose.json')
creds = store.get()
# if not creds or creds.invalid:
#     flow = client.flow_from_clientsecrets('client_secret.json', SCOPES)
#     creds = tools.run_flow(flow, store)
service = build('gmail', 'v1', http=creds.authorize(Http()))

email = "soedomoto@gmail.com"
msg = '''\
Thank you for registering AnalevR. Please activate your account by follow this link
http://localhost:8080/activate/id/{}'''.format('XXX')

message = MIMEText(msg)
message['to'] = email
message['from'] = 'user.analev.r@gmail.com'
message['subject'] = 'Activation Link'
message = {'raw': base64.urlsafe_b64encode(message.as_string().encode()).decode()}

message = service.users().messages().send(userId='me', body=message).execute()
print(message)