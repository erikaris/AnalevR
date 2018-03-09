def get_type():
    from analev_r import common
    if common.expect_json_output:
        return 'json'
    else:
        return 'pb'


def get_section(section_id):
    from bps_user.grpc.protos import user_pb2, user_pb2_grpc
    from analev_r import common
    from analev_r.tools.protobuf_to_dict import protobuf_to_dict

    def _get_section():
        section_service = user_pb2_grpc.SectionServiceStub(common.grpc_user_channel)
        section_pb = section_service.get(user_pb2.RequestID(id=section_id))
        if common.expect_json_output:
            section_pb = protobuf_to_dict(section_pb)

        # common.db.session.remove()

        return section_pb

    if section_id:
        return common.memoizer.get(str('section-{}-{}'.format(section_id, get_type())), _get_section, max_age=3600)

    return None


def get_user(user_id):
    from bps_user.grpc.protos import user_pb2, user_pb2_grpc
    from analev_r import common
    from analev_r.tools.protobuf_to_dict import protobuf_to_dict

    def _get_user():
        user_service = user_pb2_grpc.UserServiceStub(common.grpc_user_channel)
        user_pb = user_service.get(user_pb2.RequestID(id=user_id))
        if common.expect_json_output:
            user_pb = protobuf_to_dict(user_pb)

        # common.db.session.remove()

        return user_pb

    if user_id:
        return common.memoizer.get(str('user-{}-{}'.format(user_id, get_type())), _get_user, max_age=3600)

    return None


def get_event(event_id):
    from analev_r.grpc.protos import task_calendar_pb2
    from analev_r import common
    from analev_r.models.event import EventModel

    def _get_event():
        event = EventModel.query.get(event_id)
        if common.expect_json_output:
            event_pb = event.as_dict()
        else:
            event_pb = task_calendar_pb2.Event(id=event.id, title=event.title, start=event.start_timestamp,
                                               end=event.end_timestamp, color=event.color, section=event.section)

        return event_pb

    if event_id:
        event = common.memoizer.get(str('event-{}-{}'.format(event_id, get_type())), _get_event, max_age=3600)
        return event

    return None


def get_unit(unit_id):
    from analev_r.grpc.protos import task_calendar_pb2
    from analev_r import common
    from analev_r.models.user import UserModel

    def _get_unit():
        unit = UserModel.query.get(unit_id)
        if common.expect_json_output:
            unit_pb = unit.as_dict()
        else:
            unit_pb = task_calendar_pb2.Unit(id=unit.id, name=unit.name)

        # common.db.session.remove()

        return unit_pb

    if unit_id:
        return common.memoizer.get(str('unit-{}-{}'.format(unit_id, get_type())), _get_unit, max_age=3600)

    return None


def get_attachment(attachment_id):
    from analev_r.grpc.protos import task_calendar_pb2
    from analev_r import common
    from analev_r.models.attachment import AttachmentModel

    def _get_attachment():
        attachment = AttachmentModel.query.get(attachment_id)
        if attachment:
            if common.expect_json_output:
                attachment_pb = attachment.as_dict()
            else:
                attachment_pb = task_calendar_pb2.Attachment(id=attachment.id, name=attachment.title)

            return attachment_pb
        return None

    if attachment_id:
        return common.memoizer.get(str('attachment-{}-{}'.format(attachment_id, get_type())), _get_attachment, max_age=3600)

    return None
