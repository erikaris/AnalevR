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

            msg = '''\
From: Analev-R <user.analev.r@gmail.com>
Subject: Activation Link

Thank you for registering AnalevR. Please activate your account by follow this link
http://localhost:8080/activate/id/{}'''.format(user.id)

            server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            server.ehlo()
            server.login('user.analev.r', 'python.r')
            server.sendmail('user.analev.r@gmail.com', email, msg)
            server.close()

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
            else:
                session['error'] = 'The activation link is invalid'

            if session['error']:
                return session['error']
            else:
                session['error'] = 'Your account is activated. Please login to continue'
                return redirect(common.options['BASE_URL'] + '/', code=302)

        @self.route('/resend-activation', methods=['POST'])
        def home_resend_activation_post():
            email = request.form.get('email', '')

            session['error'] = None
            user = UserModel.query.filter(UserModel.email == email).first()

            msg = '''\
From: Analev-R <user.analev.r@gmail.com>
Subject: Activation Link

Thank you for registering AnalevR. Please activate your account by follow this link
http://localhost:8080/activate/id/{}'''.format(user.id)

            server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            server.ehlo()
            server.login('user.analev.r', 'python.r')
            server.sendmail('user.analev.r@gmail.com', email, msg)
            server.close()

            session['error'] = 'Activation email has been sent. Please follow the link attached in the email to activate.'
            return redirect(common.options['BASE_URL'] + '/', code=302)
