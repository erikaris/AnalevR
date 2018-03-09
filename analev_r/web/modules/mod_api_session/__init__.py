import json
from datetime import datetime

import subprocess

import requests
import zmq
import os
from flask import Blueprint, request

from analev_r import common, get_type
from analev_r.models import alchemyencoder
from analev_r.models.user import SessionModel
from analev_r.web import Response


class APISession(Blueprint):
    def __init__(self):
        Blueprint.__init__(self, 'api_session', __name__, url_prefix='/api/session',
                           template_folder='views',
                           static_folder='static',
                           static_url_path='/static/api')

        @self.route('/list/', methods=['GET'])
        @self.route('/list', methods=['GET'])
        def api_session_list():
            sessions = SessionModel.query.filter().all()
            return Response(message=json.loads(json.dumps([r.as_dict() for r in sessions], default=alchemyencoder)),
                            status=200, mimetype='application/json')

        @self.route('/create/', methods=['POST'])
        @self.route('/create', methods=['POST'])
        def api_session_add():
            user_id = request.form.get('user_id', '')

            try:
                session = SessionModel()
                session.user_id = user_id
                session.label = 'Blank Workspace'

                common.db.session.add(session)
                common.db.session.commit()

                return Response(message='New session created with id="{}"'.format(session.id),
                                data=session.id, status=200, mimetype='application/json')
            except Exception as e:
                return Response(response=json.dumps({
                    'success': False,
                    'error_message': str(e)
                }), status=200, mimetype='application/json')

        def start_session(id):
            try:
                user_id = request.form.get('user_id', '')
                session = SessionModel.query.filter(SessionModel.id == id, SessionModel.user_id == user_id).first()
                port = session.port # or common.random_port()
                if not port:
                    port = common.random_port()

                is_started = False
                # Check whether port in used --> already started
                if common.is_active_port(port):
                    # Check whether this is zmq socket
                    ctx = zmq.Context()
                    sock = ctx.socket(zmq.REQ)
                    sock.connect('tcp://localhost:{}'.format(port))

                    poller = zmq.Poller()
                    poller.register(sock, zmq.POLLIN)

                    sock.send_string('ping')

                    socks = dict(poller.poll(1000))
                    if socks:
                        if socks.get(sock) == zmq.POLLIN:
                            if sock.recv_string() == 'pong':
                                is_started = True
                                ctx.destroy()
                            else:
                                port = common.random_port()
                        else:
                            # Timeout
                            port = common.random_port()

                if not is_started:
                    ctx = zmq.Context()
                    sock = ctx.socket(zmq.REP)
                    sock.bind("tcp://*:{}".format(common.heartbeat_port))

                    proc = subprocess.Popen(['Rscript',
                                             os.path.join(common.options['SCRIPT_DIR'], 'r-session.R'),
                                             '{}'.format(port), session.id,
                                             "tcp://localhost:{}".format(common.heartbeat_port)])
                    # print(proc.pid)
                    if sock.recv_string() == 'pong':
                        is_started = True
                        ctx.destroy()

                if is_started:
                    session.port = port
                    common.db.session.commit()

                    return (True, 'Session having id = "{}" is started'.format(session.id))
                else:
                    return (False, 'Session having id = "{}" cannot be started'.format(session.id))
            except Exception as e:
                return (False, str(e))

        @self.route('/start/<id>/', methods=['POST'])
        @self.route('/start/<id>', methods=['POST'])
        def api_session_start(id):
            success, msg = start_session(id)
            return Response(success=success, message=msg, status=200, mimetype='application/json')

        @self.route('/eval/<id>/', methods=['POST'])
        @self.route('/eval/<id>', methods=['POST'])
        def api_session_eval(id):
            try:
                user_id = request.form.get('user_id', '')
                cmd = request.form.get('cmd', '')

                while True:
                    session = SessionModel.query.filter(SessionModel.id == id, SessionModel.user_id == user_id).first()

                    ctx = zmq.Context()
                    sock = ctx.socket(zmq.REQ)
                    sock.connect("tcp://localhost:{}".format(session.port))

                    poller = zmq.Poller()
                    poller.register(sock, zmq.POLLIN)

                    sock.send_json({'cmd': cmd})

                    socks = dict(poller.poll(1000))
                    if socks:
                        if socks.get(sock) == zmq.POLLIN:
                            resp = sock.recv_string()
                            ctx.destroy()
                            break

                    # Maybe died --> restart
                    success, msg = start_session(id)
                    if success:
                        print('Session is started')

                resp = json.loads(resp)
                return Response(success=False if resp['error'][0] == 1 else True,
                                message=resp['message'][0], status=200,
                                mimetype='application/json')
            except Exception as e:
                return Response(success=False, message=str(e), status=200,
                                mimetype='application/json')

        @self.route('/delete/<id>/', methods=['GET'])
        @self.route('/delete/<id>', methods=['GET'])
        def api_session_delete(id):
            try:
                session = SessionModel.query.filter(SessionModel.id == id)

                if session.first():
                    session.delete()
                    common.db.session.commit()
                    common.memoizer.delete(str('position-{}-{}'.format(session.id, get_type())))

                    return Response(message='Session having id = "{}" is deleted'.format(id),
                                    status=200, mimetype='application/json')
                else:
                    return Response(success=False, message='Session having id = "{}" is not found'.format(id),
                                    status=200, mimetype='application/json')
            except Exception as e:
                return Response(success=False, message=str(e), status=200,
                                mimetype='application/json')

        @self.route('/search/', methods=['GET'])
        @self.route('/search', methods=['GET'])
        def api_session_search():
            q = request.args.get('q', '')
            sessions = SessionModel.query.filter(SessionModel.title.like('%{}%'.format(q))).all()
            sessions = json.loads(json.dumps([e.as_dict() for e in sessions], default=alchemyencoder))
            return Response(message=sessions, status=200, mimetype='application/json')
