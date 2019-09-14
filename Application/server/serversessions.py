import datetime
import uuid


class ServerSessions:
    sessionExpirationTime = 1  # Session expiration time in hours

    def __init__(self):
        self.sessionsMap = {}

    def insertNewSession(self, user):
        session_id = str(uuid.uuid4())
        self.sessionsMap[session_id] = {'user': user, 'ttl': datetime.datetime.now() + datetime.timedelta(
            hours=ServerSessions.sessionExpirationTime)}
        return session_id

    def getUsername(self, session_id):
        return self.sessionsMap[session_id]['user'];

    def validateSession(self, session_id):
        if self.sessionsMap[session_id] is not None:
            if self.sessionsMap[session_id]['ttl'] > datetime.datetime.now():
                return True
            else:
                self.sessionsMap[session_id] = None
                return False
        else:
            return False
