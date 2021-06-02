from http.client import HTTPException


class FailedRequestException(HTTPException):
    def __init__(self, details=": No more details"):
        self.msg_error = "Damas Error : damas core request failed !! " + details

    def __str__(self):
        return self.msg_error
