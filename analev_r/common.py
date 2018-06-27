from analev_r.models import SQLEngine


db = None
expect_json_output = True
attachment_dir = None
attachments = None
options = {}
session_port = 5100
heartbeat_port = 5600

def is_active_port(port):
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", port))
        s.close()
        return False
    except socket.error as e:
        if e.errno == 98:
            # print("Port is already in use")
            pass

        return True

def random_port():
    import socket

    for port in range(5100, 5600):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        try:
            s.bind(("127.0.0.1", port))
            s.close()
            return port
        except socket.error as e:
            if e.errno == 98:
                # print("Port is already in use")
                pass

def connect_db(db_uri):
    global db

    db = SQLEngine(db_uri)

    db.create_all()


def set_options(o):
    global options
    options = o