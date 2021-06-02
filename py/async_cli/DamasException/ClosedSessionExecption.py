from http.client import HTTPException


class ClosedSessionExecption(HTTPException):
    def __init__(self, session, details="no more details"):
        self.msg_error = "Damas Error : The {} session is closed !! ".format(session) + details

    def __str__(self):
        return self.msg_error