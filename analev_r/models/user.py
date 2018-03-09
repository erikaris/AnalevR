from sqlalchemy import Column, String, Integer, Text

from analev_r import common
from ..models import Serializable, generate_uuid


class UserModel(common.db.Model, Serializable):
    id = Column(String(36), default=generate_uuid)
    username = Column(String(255), primary_key=True, nullable=False)
    password = Column(String(255), nullable=False)

class SessionModel(common.db.Model, Serializable):
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False)
    port = Column(Integer(), nullable=True)
    label = Column(String(255), nullable=True)
    description = Column(Text(), nullable=True)