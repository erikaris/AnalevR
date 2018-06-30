import decimal
import inspect
import json
import re
import uuid
from datetime import datetime

from sqlalchemy import create_engine, MetaData, Column, orm
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm.collections import InstrumentedList
from sqlalchemy.orm.exc import UnmappedClassError

from ._compat import iteritems

_camelcase_re = re.compile(r'([A-Z]+)(?=[a-z0-9])')


def _should_set_tablename(cls):
    for base in cls.__mro__:
        d = base.__dict__

        if '__tablename__' in d or '__table__' in d:
            return False

        for name, obj in iteritems(d):
            if isinstance(obj, declared_attr):
                obj = getattr(cls, name)

            if isinstance(obj, Column) and obj.primary_key:
                return True


def camel_to_snake_case(name):
    def _join(match):
        word = match.group()

        if len(word) > 1:
            return ('_%s_%s' % (word[:-1], word[-1])).lower()

        return '_' + word.lower()

    return _camelcase_re.sub(_join, name).lstrip('_')


class _QueryProperty(object):
    def __init__(self, sa):
        self.sa = sa

    def __get__(self, obj, type):
        try:
            mapper = orm.class_mapper(type)
            if mapper:
                return type.query_class(mapper, session=self.sa.session())
        except UnmappedClassError:
            return None


class Model(object):
    query_class = None
    query = None

    _cached_tablename = None

    @declared_attr
    def __tablename__(cls):
        if (
                        '_cached_tablename' not in cls.__dict__ and
                    _should_set_tablename(cls)
        ):
            cls._cached_tablename = camel_to_snake_case(cls.__name__)

        return cls._cached_tablename


class SQLEngine(object):
    def __init__(self, db_uri='sqlite:///:memory:', model_class=Model, query_class=orm.Query, session_options=None):
        try:
            engine = create_engine(db_uri, echo=False, convert_unicode=True, pool_size=100000, max_overflow=100)
        except:
            engine = create_engine(db_uri)

        metadata = MetaData()
        metadata.bind = engine

        self.Query = query_class
        self.session = self.create_scoped_session(session_options)
        self.Model = self.make_declarative_base(model_class, metadata)

    def make_declarative_base(self, model, metadata=None):
        """Creates the declarative base."""
        base = declarative_base(cls=model, name='Model',
                                metadata=metadata)

        if not getattr(base, 'query_class', None):
            base.query_class = self.Query

        base.query = _QueryProperty(self)
        return base

    def create_scoped_session(self, options=None):
        if options is None:
            options = {}

        # scopefunc = options.pop('scopefunc', _app_ctx_stack.__ident_func__)
        options.setdefault('query_cls', self.Query)
        return orm.scoped_session(
            self.create_session(options)
            # self.create_session(options), scopefunc=scopefunc
        )

    def create_session(self, options):
        return orm.sessionmaker(**options)

    def create_all(self):
        self.Model.metadata.create_all()


class Serializable(object):
    def as_dict(self):
        public_attrs = []
        for name in dir(self):
            if not (name.startswith(
                    '_') or name == 'as_dict' or name == 'metadata' or name == 'query' or name == 'query_class'):
                public_attrs.append(name)

        return {c: getattr(self, c) for c in public_attrs if not inspect.ismethod(getattr(self, c))}


class Validation(object):
    foreign = []

    def is_valid(self):
        is_not_orphaned = True
        for f in self.foreign:
            v = getattr(self, f)
            if not v:
                is_not_orphaned = False
                break
            elif type(v) == dict:
                if 'id' not in v or not v['id']:
                    is_not_orphaned = False
                    break
            elif type(v) != dict:
                if not v.id:
                    is_not_orphaned = False
                    break

        return is_not_orphaned


class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        from sqlalchemy.ext.declarative import DeclarativeMeta

        if isinstance(obj.__class__, DeclarativeMeta):
            # an SQLAlchemy class
            fields = {}
            for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
                data = obj.__getattribute__(field)
                try:
                    json.dumps(data) # this will fail on non-encodable values, like other classes
                    fields[field] = data
                except TypeError:
                    fields[field] = None
            # a json-encodable dict
            return fields

        return json.JSONEncoder.default(self, obj)


def alchemyencoder(obj):
    """JSON encoder function for SQLAlchemy special classes."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, decimal.Decimal):
        return float(obj)
    # elif isinstance(obj, Model):
    #     d = obj.as_dict()
    #     return d


def generate_uuid():
    return str(uuid.uuid4())

