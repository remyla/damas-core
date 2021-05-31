from random import randint
import tkinter as tk

def nombre_choisi(event):
    "Callback quand le joueur a entré un nombre."
    nbre_choisi = int(reponse.get())
    reponse.delete(0, tk.END)
    proposition["text"] = nbre_choisi
    if nombre_secret > nbre_choisi:
        resultat["text"] = "Le nombre est plus grand"
    elif nombre_secret < nbre_choisi:
        resultat["text"] = "Le nombre est plus petit"
    else:
        # On enlève les éléments dont on n'a plus besoin
        lbl_reponse.destroy()
        reponse.destroy()
        # On replace les Labels `proposition` et `resultat` dans la ligne
        # en dessous du titre
        proposition.grid_forget()
        proposition.grid(row=1, column=0)
        resultat.grid_forget()
        resultat.grid(row=1, column=1)
        # On configure le label avec le texte voulu, dans la font voulue et
        # dans la couleur désirée.
        resultat.config(text="Tu as trouvé le nombre. Bravo!",
                        font=("", 12),
                        fg="green")


app = tk.Tk()
titre = tk.Label(app, text="Devine le nombre auquel je pense", font=("", 16))
titre.grid(row=0, columnspan=2, pady=8)

nombre_secret = randint(0, 100) + 1

lbl_reponse = tk.Label(app, text="Choisi un nombre entre 1 et 100 inclus:")
lbl_reponse.grid(row=1, column=0, pady=5, padx=5)

reponse = tk.Entry(app)
reponse.grid(row=1, column=1, pady=5, padx=5)
reponse.bind("<Return>", nombre_choisi)

proposition = tk.Label(app, text="")
proposition.grid(row=2, column=0, pady=5, padx=5)

resultat = tk.Label(app, text="")
resultat.grid(row=2, column=1, pady=5, padx=5)

app.mainloop()