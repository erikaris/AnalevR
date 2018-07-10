import json
import os
import signal
import subprocess
from threading import Thread

import zmq
from flask import Blueprint, request, send_file
from werkzeug.utils import secure_filename

from analev_r import common
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
            sessions = SessionModel.query.filter().order_by(SessionModel.created_date).all()
            return Response(message=json.loads(json.dumps([r.as_dict() for r in sessions], default=alchemyencoder)),
                            status=200, mimetype='application/json')

        @self.route('/list/user/<user_id>/', methods=['GET'])
        @self.route('/list/user/<user_id>', methods=['GET'])
        def api_session_user_list(user_id):
            sessions = SessionModel.query.filter(SessionModel.user_id == user_id).order_by(SessionModel.created_date).all()
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
                session = SessionModel.query.filter(SessionModel.id == id).first()
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
                                             "tcp://localhost:{}".format(common.heartbeat_port)],
                                            preexec_fn=os.setsid)
                    common.port_pid_map[port] = proc
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

            data = '[]'
            if success:
                r_nb = os.path.join(common.options['WORKSPACE_DIR'], id, 'notebook.json')
                if os.path.exists(r_nb):
                    with open(r_nb, 'r') as f:
                        data = f.read()

            return Response(success=success, message=msg, data=data, status=200, mimetype='application/json')

        @self.route('/title/', methods=['POST'])
        @self.route('/title', methods=['POST'])
        def api_session_title():
            id = request.form.get('pk', '')
            label = request.form.get('value', '')

            session = SessionModel.query.filter(SessionModel.id == id).first()
            session.label = label
            common.db.session.commit()

            return Response(success=True, message='Session label is updated', status=200, mimetype='application/json')

        @self.route('/fake/', methods=['POST'])
        @self.route('/fake', methods=['POST'])
        def api_session_fake():
            id = request.form.get('pk', '')
            label = request.form.get('value', '')

            return Response(success=True, message='Session label is updated', status=200, mimetype='application/json')

        def _session_eval(id, has_return=True):
            user_id = request.form.get('user_id', '')
            cmd = request.form.get('cmd', '')
            session = SessionModel.query.filter(SessionModel.id == id, SessionModel.user_id == user_id).first()

            common.get_semaphore(id).acquire()

            # Quit processor
            if 'quit(' in cmd or 'q(' in cmd:
                pid = common.port_pid_map[session.port]
                os.killpg(os.getpgid(pid), signal.SIGTERM)
                # os.kill(pid, signal.SIGTERM)

                pid.terminate()
                pid.kill()

                return Response(success=True, data={
                    'text': 'Shutting down...', 'type': 'plain', 'time': '0'
                }, message='', status=200, mimetype='application/json')

            # Setup receiver
            cb_port = common.random_port()
            cb_ctx = zmq.Context()
            cb_sock = cb_ctx.socket(zmq.REP)
            cb_sock.bind("tcp://*:{}".format(cb_port))

            # Send message
            while True:
                ctx = zmq.Context()
                sock = ctx.socket(zmq.REQ)
                sock.connect("tcp://localhost:{}".format(session.port))

                poller = zmq.Poller()
                poller.register(sock, zmq.POLLIN)

                sock.send_json({'cmd': cmd, 'callback': "tcp://localhost:{}".format(cb_port)})

                socks = dict(poller.poll(1000))
                if socks:
                    if socks.get(sock) == zmq.POLLIN:
                        ctx.destroy()
                        break

                # Maybe died --> restart
                success, msg = start_session(id)
                if success:
                    print('Session is started')

            # Wait for reply
            resp = cb_sock.recv_string()
            cb_ctx.destroy()
            common.get_semaphore(id).release()

            resp = json.loads(resp)

            success = False if resp['error'][0] == 1 else True
            type = resp['data']['type'][0]
            text = resp['data']['text'][0]
            time = resp['data']['time'][0]
            ut, st, et, _, _ = time.split(', ')
            time = {'user': ut, 'system': st, 'elapsed': et}

            if not success:
                text = text.replace('Error in eval(expr, envir, enclos):', '').strip()

            if has_return:
                if success:
                    return success, {
                            'text': text, 'type': type, 'time': time
                        }, "OK"
                else:
                    return success, {
                        'text': text, 'type': type, 'time': time
                    }, text
            else:
                return success, {}, "OK"

        @self.route('/eval/<id>/', defaults={'has_return': 1}, methods=['POST'])
        @self.route('/eval/<id>', defaults={'has_return': 1}, methods=['POST'])
        @self.route('/eval/<id>/return/<int:has_return>/', methods=['POST'])
        @self.route('/eval/<id>/return/<int:has_return>', methods=['POST'])
        def api_session_eval(id, has_return):
            has_return = bool(has_return)

            try:
                success, data, message = _session_eval(id, has_return)
                return Response(success=success, data=data, message=message, status=200, mimetype='application/json')
            except Exception as e:
                return Response(success=False, message=str(e), status=200,
                                mimetype='application/json')

        @self.route('/save/<id>/', methods=['POST'])
        @self.route('/save/<id>', methods=['POST'])
        def api_session_save(id):
            try:
                user_id = request.form.get('user_id', '')
                content = request.form.get('content', '')

                session = SessionModel.query.filter(SessionModel.id == id, SessionModel.user_id == user_id).first()
                if session:
                    r_nb = os.path.join(common.options['WORKSPACE_DIR'], session.id, 'notebook.json')
                    with open(r_nb, 'wb') as f:
                        f.write(content.encode('utf-8'))
                        f.flush()

                    return Response(success=True, message='Notebook saved', status=200,
                                    mimetype='application/json')
                else:
                    return Response(success=False, message='Your session is expired. Please re-login', status=200,
                                    mimetype='application/json')
            except Exception as e:
                return Response(success=False, message=str(e), status=200,
                                mimetype='application/json')

        @self.route('/download/<id>/', methods=['GET'])
        @self.route('/download/<id>', methods=['GET'])
        def api_session_download(id):
            try:
                of = os.path.abspath(os.path.join(common.options['WORKSPACE_DIR'], id, 'session.zip'))
                subprocess.call(['7z', 'a', '-pP4$$W0rd', '-y', of] +
                     [
                         os.path.abspath(os.path.join(common.options['WORKSPACE_DIR'], id, 'notebook.json')),
                         os.path.abspath(os.path.join(common.options['WORKSPACE_DIR'], id, 'session.Rdata')),
                     ])

                return send_file(
                    of,
                    mimetype='application/zip',
                    as_attachment=True,
                    attachment_filename=id + '.zip')
            except Exception as e:
                return send_file(
                    os.io.BytesIO(b''),
                    mimetype='application/zip',
                    as_attachment=True,
                    attachment_filename=id + '.zip')

        @self.route('/upload/<id>/', methods=['POST'])
        @self.route('/upload/<id>', methods=['POST'])
        def api_session_upload(id):
            try:
                if 'file' in request.files:
                    file = request.files['file']

                    od = os.path.abspath(os.path.join(common.options['WORKSPACE_DIR'], id))
                    of = os.path.abspath(os.path.join(common.options['WORKSPACE_DIR'], id, 'session.zip'))
                    file.save(of)

                    subprocess.call(['7z', 'x', '-pP4$$W0rd', '-o' + od, '-aoa', '-y', of])

                    return Response(success=True, message='Session having id = "{}" is uploaded'.format(id),
                                status=200, mimetype='application/json')

                else:
                    raise Exception('No file is uploaded')

            except Exception as e:
                return Response(success=False, message=str(e), status=200,
                                mimetype='application/json')

        @self.route('/delete/<id>/', methods=['POST'])
        @self.route('/delete/<id>', methods=['POST'])
        def api_session_delete(id):
            try:
                user_id = request.form.get('user_id', '')
                session = SessionModel.query.filter(SessionModel.id == id, SessionModel.user_id == user_id).first()

                if session:
                    common.db.session.delete(session)
                    common.db.session.commit()

                    return Response(success=True, message='Session having id = "{}" is deleted'.format(id),
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
