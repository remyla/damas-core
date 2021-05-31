class NoneResultException(Exception):
    def __init__(self, msg="Damas Error : None Result Error :"):
        self.msgError = msg

    def throw(self, details="no more details"):
        print(self.msgError + details)
