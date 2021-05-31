class EmptyException(Exception):
    def __init__(self, element=None):
        self.msgError = "Damas Error : Empty {}} Element Error :".format(element)

    def throw(self, details="no more details"):
        print(self.msgError + details)
