import json

from flask import Blueprint
from sqlalchemy.orm import joinedload

from analev_r.models import alchemyencoder
from analev_r.models.data import DataModel, TagModel
from analev_r.models.user import SessionModel
from analev_r.web import Response


class APIData(Blueprint):
    def __init__(self):
        Blueprint.__init__(self, 'api_data', __name__, url_prefix='/api/data',
                           template_folder='views',
                           static_folder='static',
                           static_url_path='/static/api')

        @self.route('/list/', methods=['GET'])
        @self.route('/list', methods=['GET'])
        def api_data_list():
            sessions = DataModel.query.options(joinedload(DataModel.tags, innerjoin=True)).filter().all()
            js = json.dumps([r.as_dict() for r in sessions], default=alchemyencoder)
            return Response(message="OK", data=json.loads(js),
                            status=200, mimetype='application/json')

        @self.route('/tag/list/', methods=['GET'])
        @self.route('/tag/list', methods=['GET'])
        def api_tag_list():
            sessions = TagModel.query.filter().all()
            return Response(message=json.loads(json.dumps([r.as_dict() for r in sessions], default=alchemyencoder)),
                            status=200, mimetype='application/json')