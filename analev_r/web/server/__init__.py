import os
import pkgutil
import sys
from optparse import OptionParser

import datetime
from flask import Flask, Blueprint, render_template, session
from flask_session import Session

from analev_r import common
from analev_r.web import ModifiedLoader

flask_app = None


class FlaskApp(Flask):
    def __init__(self, options):
        Flask.__init__(self, __name__, static_folder=os.path.join(options['BASE_DIR'], 'static'),
                       template_folder=os.path.join(options['BASE_DIR'], 'templates'))

        global flask_app
        flask_app = self

        # Configurations
        self.config.from_mapping(options)
        self.jinja_options = Flask.jinja_options.copy()
        self.jinja_options['loader'] = ModifiedLoader(self)

        common.connect_db(options['SQLALCHEMY_DATABASE_URI'])
        common.set_options(options)

        # @self.before_request
        # def before_request():
        #     print(datetime.datetime.utcnow())

        @self.teardown_appcontext
        def shutdown_session(response_or_exc):
            if self.config['SQLALCHEMY_COMMIT_ON_TEARDOWN']:
                if response_or_exc is None:
                    if common.db.session:
                        common.db.session.commit()

            if common.db.session:
                common.db.session.remove()
            return response_or_exc

        self.load_modules()
        self.configure_session()

    def load_modules(self):
        # Sample HTTP error handling
        @self.errorhandler(404)
        def not_found(error):
            return render_template('404.html'), 404

        # Load all modules
        modules_dir = os.path.join(self.config['BASE_DIR'], 'modules')
        sys.path.append(modules_dir)
        for importer, package_name, _ in pkgutil.iter_modules([modules_dir]):
            importer.find_module(package_name).load_module(package_name)

        # Register modules
        for mod_cls in Blueprint.__subclasses__():
            if str(mod_cls.__module__).startswith('mod'):
                mod = mod_cls()
                self.register_blueprint(mod)

        common.db.create_all()

    def configure_session(self):
        self.permanent_session_lifetime = datetime.timedelta(minutes=40)
        Session(self)
        self.session_interface.db.create_all()

    def set_logged_user(self, user):
        session['user'] = user

    def get_logged_user(self):
        return session['user']

    def is_logged_in(self):
        user = session.get('user', '')
        if user:
            return True
        return False

    def is_same_user(self, id):
        user = session.get('user', '')
        if user and user.id == id:
            return True
        return False

    def is_admin(self):
        user = session.get('user', '')
        if user and user.type_id == 2:
            return True
        return False

    def is_subject_matter(self, event):
        return True

    def run_server(self):
        self.run(host=self.config['HOST'], port=int(self.config['PORT']), debug=self.config['DEBUG'],
                 threaded=True, use_reloader=False)


def main():
    parser = OptionParser()
    parser.add_option("-D", "--database-url",
                      dest="SQLALCHEMY_DATABASE_URI", default='sqlite:////tmp/analev_r.db',
                      help="Database URL")
    parser.add_option("-H", "--host",
                      dest="HOST", default='0.0.0.0',
                      help="Host of server")
    parser.add_option("-P", "--port",
                      dest="PORT", default=8080,
                      help="Port of server")
    parser.add_option("-W", "--workspace-dir",
                      dest="WORKSPACE_DIR", default=None,
                      help="Workspace directory")
    parser.add_option("-S", "--script-dir",
                      dest="SCRIPT_DIR", default=None,
                      help="Script directory")
    parser.add_option("-C", "--credential-file",
                      dest="CREDENTIAL_FILE", default=None,
                      help="Gmail Credential JSON File")
    parser.add_option("-d", "--debug",
                      action="store_true", dest="DEBUG", default=False,
                      help="Print server debug messages")

    (options, args) = parser.parse_args()
    options = vars(options)

    # Add some necessary config variables
    options['BASE_URL'] = 'http://{}:{}'.format(options['HOST'], options['PORT'])
    options['BASE_DIR'] = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    options['TEMPLATE_DIR'] = os.path.join(options['BASE_DIR'], 'templates')
    if not options['WORKSPACE_DIR']:
        options['WORKSPACE_DIR'] = os.path.abspath(os.path.join(options['BASE_DIR'], os.pardir, os.pardir, 'r_workspace'))
    if not options['SCRIPT_DIR']:
        options['SCRIPT_DIR'] = os.path.abspath(os.path.join(options['BASE_DIR'], os.pardir, os.pardir, 'r_scripts'))
    options['CREDENTIAL_FILE'] = os.path.abspath(os.path.join(options['BASE_DIR'], os.pardir, os.pardir, options['CREDENTIAL_FILE']))
    options['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    options['DATABASE_CONNECT_OPTIONS'] = {}
    options['THREADS_PER_PAGE'] = 10
    options['CSRF_ENABLED'] = True
    options['CSRF_SESSION_KEY'] = 'secret'
    options['SECRET_KEY'] = 'secret'
    options['SESSION_TYPE'] = 'sqlalchemy'
    options['SESSION_SQLALCHEMY_TABLE'] = 'sessions'

    FlaskApp(options).run_server()


if __name__ == "__main__":
    main()
