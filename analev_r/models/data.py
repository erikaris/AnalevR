from sqlalchemy import Column, String, Table, ForeignKey
from sqlalchemy.orm import relationship, backref

from analev_r import common
from ..models import Serializable, generate_uuid


class DataTagModel(common.db.Model, Serializable):
    __tablename__ = 'data_tag_model'
    tag_id = Column(String(36), ForeignKey('tag_model.id'), primary_key=True)
    data_id = Column(String(36), ForeignKey('data_model.id'), primary_key=True)


tags = DataTagModel()


class TagModel(common.db.Model, Serializable):
    __tablename__ = 'tag_model'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    tag = Column(String(255), nullable=False)


class DataModel(common.db.Model, Serializable):
    __tablename__ = 'data_model'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    original_filename = Column(String(255), nullable=False)
    extension = Column(String(10), nullable=False)
    label = Column(String(255), nullable=False)
    r_handler = Column(String(255), nullable=False)
    # tags = relationship('TagModel', secondary='data_tag_model', lazy='joined', backref=backref('data_model', lazy=True))
