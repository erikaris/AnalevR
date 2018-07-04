import hashlib
import os
import smtplib

from flask import Blueprint, render_template, request, session
from werkzeug.utils import redirect

from analev_r import common
from analev_r.models.user import SessionModel, UserModel


class Home(Blueprint):
    def __init__(self):
        Blueprint.__init__(self, 'home', __name__, url_prefix='',
                           template_folder=os.path.join(os.path.dirname(__file__), 'views'),
                           static_folder=os.path.join(os.path.dirname(__file__), 'static'),
                           static_url_path='/static/home')

        def send_email(to, user_id, domain='http://localhost:8080'):
            import base64
            from email.mime.text import MIMEText
            from googleapiclient.discovery import build
            from httplib2 import Http
            from oauth2client import file, client, tools

            # Setup the Gmail API
            SCOPES = 'https://www.googleapis.com/auth/gmail.compose'
            store = file.Storage(common.options['CREDENTIAL_FILE'])
            creds = store.get()
            service = build('gmail', 'v1', http=creds.authorize(Http()))

            email = to
            msg = '''\
Thank you for registering AnalevR. Please activate your account by follow this link
{}/activate/id/{}'''.format(domain, user_id)

            message = MIMEText(msg)
            message['to'] = to
            message['from'] = 'user.analev.r@gmail.com'
            message['subject'] = 'Activation Link'
            message = {'raw': base64.urlsafe_b64encode(message.as_string().encode()).decode()}

            message = service.users().messages().send(userId='me', body=message).execute()
            return message['id']

        @self.route('/register/', methods=['POST'])
        @self.route('/register', methods=['POST'])
        def home_register_post():
            firstname = request.form.get('firstname', '')
            lastname = request.form.get('lastname', '')
            email = request.form.get('email', '')
            confirm_password = request.form.get('confirm-password', '')
            password = request.form.get('password', '')
            hashed_password = hashlib.md5(str(password).encode()).hexdigest()

            session['error'] = None
            if password != confirm_password:
                session['error'] = 'Password is not match'

            if not session['error']:
                user = UserModel.query.filter(UserModel.email == email).first()
                if user:
                    session['error'] = 'Email is already registered'

            if session['error']:
                session['page'] = 'registration'
                session['firstname'] = firstname
                session['lastname'] = lastname
                session['email'] = email
                return render_template('post_register.html', request_path=request.path)

            session['page'] = None
            session['firstname'] = None
            session['lastname'] = None
            session['email'] = None

            user = UserModel()
            user.firstname = firstname
            user.lastname = lastname
            user.email = email
            user.password = hashed_password

            common.db.session.add(user)
            common.db.session.commit()

            send_email(email, user.id, 'https://simpeg.bps.go.id/analev-r')

            return redirect(common.options['BASE_URL'] + '/', code=302)

        @self.route('/login', methods=['GET'])
        def home_login_get():
            print(session)

            return render_template('post_login.html', request_path=request.path, next_path='/')

        @self.route('/login', methods=['POST'])
        def home_login_post():
            email = request.form.get('email', '')
            password = request.form.get('password', '')
            hashed_password = hashlib.md5(str(password).encode()).hexdigest()
            next_path = request.args.get('next')

            session['error'] = None
            user = UserModel.query.filter(UserModel.email == email, UserModel.password == hashed_password).first()

            if not user:
                session['error'] = 'Username and Password is not match'
            else:
                if not user.is_activated:
                    session['error'] = 'Your account is not activated yet. Please follow the link sent to your email or <a href="#" class="ln-resend-activation-email">resend activation email</a>.'
                else:
                    session['user'] = user

            return render_template('post_login.html', user=user, session=session, request_path=request.path, next_path=next_path)

        @self.route('/', defaults={'id': None}, methods=['GET'])
        @self.route('/session/<id>/', methods=['GET'])
        @self.route('/session/<id>', methods=['GET'])
        def home_session(id):
            user = session.get('user')

            # if user and id:
            #     sess = SessionModel.query.filter(SessionModel.id == id, SessionModel.user_id == user.id).first()
            # else:
            #     sess = None

            if id:
                sess = SessionModel.query.filter(SessionModel.id == id).first()
            else:
                sess = None

            if not request.referrer:
                session['error'] = None
                session['page'] = None

            if 'error' not in session:
                session['error'] = None

            return render_template('session_index.html', session=sess, user=user,
                                   error=session['error'] if 'error' in session else None,
                                   page=session['page'] if 'page' in session else None,
                                   registration_data={
                                       'firstname': session['firstname'] if 'firstname' in session else '',
                                       'lastname': session['lastname'] if 'lastname' in session else '',
                                       'email': session['email'] if 'email' in session else ''
                                   }, request_path=request.path)

        @self.route('/logout/', methods=['GET'])
        @self.route('/logout', methods=['GET'])
        def home_logout():
            session['user'] = None
            return render_template('post_logout.html', request_path=request.path, next_path='/')

        @self.route('/activate/id/<id>/', methods=['GET'])
        @self.route('/activate/id/<id>', methods=['GET'])
        def home_activate_get(id):
            session['error'] = None
            session['info'] = None

            user = UserModel.query.filter(UserModel.id == id).first()
            if user:
                user.is_activated = True
                common.db.session.commit()
                session['error'] = 'Your account is activated. Please login to continue'
            else:
                session['error'] = 'The activation link is invalid'

            return render_template('post_activate.html', request_path=request.path, next_path='/')

        @self.route('/resend-activation', methods=['POST'])
        def home_resend_activation_post():
            email = request.form.get('email', '')

            session['error'] = None
            user = UserModel.query.filter(UserModel.email == email).first()

            send_email(email, user.id, 'https://simpeg.bps.go.id/analev-r')

            session['error'] = 'Activation email has been sent. Please follow the link attached in the email to activate.'
            return render_template('post_resend_link.html', request_path=request.path, next_path='/')
