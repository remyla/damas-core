from http.client import HTTPException


class EmptyElementException(HTTPException):
    def __init__(self, key, details="no more details"):
        self.msg_error = "Damas Error : {} key is empty :".format(key) + details
        super().__init__(self.msg_error)

    def __str__(self):
        return self.msg_error