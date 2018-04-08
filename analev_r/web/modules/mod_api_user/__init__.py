import hashlib
import json

from flask import Blueprint, request

from analev_r import common
from analev_r.models import alchemyencoder
from analev_r.models.user import UserModel
from analev_r.web import Response


class APIUser(Blueprint):
    def __init__(self):
        Blueprint.__init__(self, 'api_user', __name__, url_prefix='/api/user',
                           template_folder='views',
                           static_folder='static',
                           static_url_path='/static/api')

        @self.route('/list/', methods=['GET'])
        @self.route('/list', methods=['GET'])
        def api_user_list():
            users = UserModel.query.filter().all()
            return Response(message=json.loads(json.dumps([r.as_dict() for r in users], default=alchemyencoder)),
                            status=200, mimetype='application/json')

        @self.route('/add/', methods=['POST'])
        @self.route('/add', methods=['POST'])
        def api_user_add():
            username = request.form.get('username', '')
            password = request.form.get('password', '')

            try:
                user = UserModel()
                user.username = username
                user.password = hashlib.md5(str(password).encode()).hexdigest()

                common.db.session.add(user)
                common.db.session.commit()

                return Response(message='New user added with id="{}"'.format(user.id),
                                status=200, mimetype='application/json')
            except Exception as e:
                return Response(response=json.dumps({
                    'success': False,
                    'error_message': str(e)
                }), status=200, mimetype='application/json')

        @self.route('/edit/<id>/', methods=['POST'])
        @self.route('/edit/<id>', methods=['POST'])
        def api_user_edit(id):
            username = request.form.get('username', '')
            password = request.form.get('password', '')

            try:
                user = UserModel.query.filter(UserModel.id == id).first()

                if user:
                    user.username = username
                    user.password = hashlib.md5(str(password).encode()).hexdigest()

                    common.db.session.commit()

                    return Response(message='User having id = "{}" is updated'.format(id), status=200,
                                    mimetype='application/json')
                else:
                    return Response(success=False,
                                    message='User having id = "{}" is not found!'.format(id),
                                    status=200, mimetype='application/json')
            except Exception as e:
                return Response(success=False, message=str(e), status=200,
                                mimetype='application/json')

        @self.route('/delete/<id>/', methods=['GET'])
        @self.route('/delete/<id>', methods=['GET'])
        def api_user_delete(id):
            try:
                user = UserModel.query.filter(UserModel.id == id)

                if user.first():
                    user.delete()
                    common.db.session.commit()

                    return Response(message='User having id = "{}" is deleted'.format(id),
                                    status=200, mimetype='application/json')
                else:
                    return Response(success=False, message='User having id = "{}" is not found'.format(id),
                                    status=200, mimetype='application/json')
            except Exception as e:
                return Response(success=False, message=str(e), status=200,
                                mimetype='application/json')

        @self.route('/search/', methods=['GET'])
        @self.route('/search', methods=['GET'])
        def api_user_search():
            q = request.args.get('q', '')
            users = UserModel.query.filter(UserModel.title.like('%{}%'.format(q))).all()
            users = json.loads(json.dumps([e.as_dict() for e in users], default=alchemyencoder))
            return Response(message=users, status=200, mimetype='application/json')
