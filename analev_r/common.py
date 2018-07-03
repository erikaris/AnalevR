from analev_r.models import SQLEngine


db = None
expect_json_output = True
attachment_dir = None
attachments = None
options = {}
session_port = 5100
heartbeat_port = 5600
locks = {}
semaphores = {}

def get_lock(id):
    import threading

    if id not in locks:
        locks[id] = threading.Lock

    return locks[id]

def get_semaphore(id):
    from threading import BoundedSemaphore

    if id not in semaphores:
        semaphores[id] = BoundedSemaphore()

    return semaphores[id]

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

    for port in range(5100, 10000):
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

class LZW(object):
    @staticmethod
    def compress(uncompressed):
        """Compress a string to a list of output symbols."""

        # Build the dictionary.
        dict_size = 256
        dictionary = dict((chr(i), i) for i in range(dict_size))
        # in Python 3: dictionary = {chr(i): i for i in range(dict_size)}

        w = ""
        result = []
        for c in uncompressed:
            wc = w + c
            if wc in dictionary:
                w = wc
            else:
                result.append(dictionary[w])
                # Add wc to the dictionary.
                dictionary[wc] = dict_size
                dict_size += 1
                w = c

        # Output the code for w.
        if w:
            result.append(dictionary[w])
        return result

    @staticmethod
    def decompress(compressed):
        """Decompress a list of output ks to a string."""
        from cStringIO import StringIO

        # Build the dictionary.
        dict_size = 256
        dictionary = dict((i, chr(i)) for i in range(dict_size))
        # in Python 3: dictionary = {i: chr(i) for i in range(dict_size)}

        # use StringIO, otherwise this becomes O(N^2)
        # due to string concatenation in a loop
        result = StringIO()
        w = chr(compressed.pop(0))
        result.write(w)
        for k in compressed:
            if k in dictionary:
                entry = dictionary[k]
            elif k == dict_size:
                entry = w + w[0]
            else:
                raise ValueError('Bad compressed k: %s' % k)
            result.write(entry)

            # Add w+entry[0] to the dictionary.
            dictionary[dict_size] = w + entry[0]
            dict_size += 1

            w = entry
        return result.getvalue()