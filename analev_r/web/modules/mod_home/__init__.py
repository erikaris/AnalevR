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

        @self.route('/', methods=['GET'])
        def home_index():
            user = session.get('user')
            if not user:
                return redirect(common.options['BASE_URL'] + '/login/', code=302)

            sessions = SessionModel.query.filter(SessionModel.user_id == user.id).all()
            # sessions = sessions[:10]
            # sessions = sessions + [SessionModel() for i in range(10 - len(sessions))]
            # for sess in sessions:
            #     if not sess.id:
            #         sess.id = ''
            #
            # return render_template('home_index_2.html', sessions=sessions,
            #                        base_url=common.options['BASE_URL'], user_id=user.id)

            if len(sessions) > 0:
                return redirect(common.options['BASE_URL'] + '/session/' + sessions[0].id, code=302)
            else:
                return render_template('home_index.html', sessions=sessions, base_url=common.options['BASE_URL'], user=user)

        @self.route('/session/<id>/', methods=['GET'])
        @self.route('/session/<id>', methods=['GET'])
        def home_session(id):
            user = session.get('user')
            if not user:
                return redirect(common.options['BASE_URL'] + '/login/', code=302)

            sess = SessionModel.query.filter(SessionModel.id == id, SessionModel.user_id == user.id).first()

            return render_template('session_index.html', session=sess, session_id=id, user=user,
                                   base_url=common.options['BASE_URL'])

        @self.route('/login/', methods=['GET'])
        @self.route('/login', methods=['GET'])
        def home_login():
            return render_template('login_index.html', base_url=common.options['BASE_URL'],
                                   session=session)

        @self.route('/login/', methods=['POST'])
        @self.route('/login', methods=['POST'])
        def home_login_post():
            email = request.form.get('email', '')
            password = request.form.get('password', '')
            hashed_password = hashlib.md5(str(password).encode()).hexdigest()

            session['error'] = None
            user = UserModel.query.filter(UserModel.email == email, UserModel.password == hashed_password).first()
            if not user:
                session['error'] = 'Username and Password is not match'
            elif not user.is_activated:
                session['error'] = 'Your account is not activated yet. Please follow the link sent to your email.'

            if session['error']:
                return redirect(common.options['BASE_URL'] + '/login')

            session['user'] = user
            return redirect(common.options['BASE_URL'] + '/', code=302)

        @self.route('/logout/', methods=['GET'])
        @self.route('/logout', methods=['GET'])
        def home_logout():
            session['user'] = None
            return redirect(common.options['BASE_URL'] + '/', code=302)

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
                session['firstname'] = firstname
                session['lastname'] = lastname
                session['email'] = email
                return redirect(common.options['BASE_URL'] + '/login')

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

            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.ehlo()
            server.starttls()
            server.login('user.analev.r', 'python.r')
            server.sendmail('user.analev.r@gmail.com', email, msg)
            server.close()

            return redirect(common.options['BASE_URL'] + '/', code=302)

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
                session['info'] = 'Your account is activated. Please login to continue'
                return redirect(common.options['BASE_URL'] + '/login', code=302)