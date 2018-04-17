import hashlib
import os

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
            sessions = sessions[:10]
            sessions = sessions + [SessionModel() for i in range(10 - len(sessions))]
            for sess in sessions:
                if not sess.id:
                    sess.id = ''

            return render_template('home_index.html', sessions=sessions,
                                   base_url=common.options['BASE_URL'], user_id=user.id)

        @self.route('/session/<id>/', methods=['GET'])
        @self.route('/session/<id>', methods=['GET'])
        def home_session(id):
            user = session.get('user')
            if not user:
                return redirect(common.options['BASE_URL'] + '/login/', code=302)

            sess = SessionModel.query.filter(SessionModel.id == id, SessionModel.user_id == user.id).first()

            return render_template('session_index.html', session=sess, session_id=id, user_id=user.id,
                                   base_url=common.options['BASE_URL'])

        @self.route('/login/', methods=['GET'])
        @self.route('/login', methods=['GET'])
        def home_login():
            return render_template('login_index.html', base_url=common.options['BASE_URL'])

        @self.route('/login/', methods=['POST'])
        @self.route('/login', methods=['POST'])
        def home_login_post():
            username = request.form.get('username', '')
            password = request.form.get('password', '')

            user = UserModel.query.filter(UserModel.username == username,
                                   UserModel.password == hashlib.md5(str(password).encode()).hexdigest())\
                .first()
            session['user'] = user

            return redirect(common.options['BASE_URL'] + '/', code=302)

        @self.route('/register/', methods=['POST'])
        @self.route('/register', methods=['POST'])
        def home_register_post():
            username = request.form.get('username', '')
            password = request.form.get('password', '')

            user = UserModel()
            user.username = username
            user.password = hashlib.md5(str(password).encode()).hexdigest()

            common.db.session.add(user)
            common.db.session.commit()

            return redirect(common.options['BASE_URL'] + '/', code=302)
