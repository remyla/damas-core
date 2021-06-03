from http.client import HTTPException


class NotFoundException(HTTPException):
    def __init__(self, element,details=": No more details"):
        self.msg_error = "Damas Error : The element with {} id is not found !! !! ".format(element) + details

    def __str__(self):
        return self.msg_error