from http.client import HTTPException


class AlreadyExistException(HTTPException):
    def __init__(self, element, details=": No more details"):
        self.msg_error = "Damas Error : The element {} already exist !! ".format(element) + details

    def __str__(self):
        return self.msg_error
