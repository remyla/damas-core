import tkinter as tk


class Application:
    def __init__(self, app):
        self.tinkerApp = app
        self.compteur = 0
        self.compteur_lbl = tk.Label(app, text=str(self.compteur), font=("", 16))
        self.compteur_lbl.grid(padx=8, pady=8)

    def on_double_click(self, event):
        print("double clique à la Position de la souris:", event.x, event.y)

    def incremente(self):
        # "Incrémente le compteur à chaque seconde"
        # global compteur
        self.compteur += 1
        self.compteur_lbl['text'] = str(self.compteur)
        # self.after(1000, self.incremente())
        self.after_1s()

    def bind(self):
        self.tinkerApp.bind("<Double-Button-1>", self.on_double_click)

    # def after_1s(self, delay, callback):
    def after_1s(self):
        self.tinkerApp.after(1000, self.incremente())
        # self.tinkerApp.after(delay, callback)


def mainGUI():
    app = Application(tk.Tk())
    #
    app.bind()
    app.incremente()
    #
    app.mainloop()
    print("On quitte le programe.")  # On teste quand on sort du mainloop


if __name__ == '__main__':
    mainGUI()
import tkinter as tk

def incremente():
    "Incrémente le compteur à chaque seconde"
    global compteur
    compteur += 1
    compteur_lbl['text'] = str(compteur)
    app.after(1000, incremente)

app = tk.Tk()
compteur = 0
compteur_lbl = tk.Label(app, text=str(compteur), font=("", 16))
compteur_lbl.grid(padx=8, pady=8)

app.after(1000, incremente)
app.mainloop()