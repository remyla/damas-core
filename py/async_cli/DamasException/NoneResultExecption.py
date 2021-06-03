class NoneResultException(Exception):
    def __init__(self, details="no more details"):
        self.msg_error = "Damas Error : None Result Error :" + details

    def __str__(self):
        return self.msg_error