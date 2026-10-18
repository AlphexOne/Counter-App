# Counter-App

Mehrere Views:

- main View 
- Counter View


---

### main View:

auf dem mainView gibt es oben im Header einen addBtn dieser soll einen neuen (Standartcounter) erstellen.

**Standartcounter:** 
- hat einen vorgegebenen namen "neuer Counter" der nächste hat dann zB. wenn es bereits einen "neuen Counter" gibt "neuen Counter1" usw.
- im CounterView gibt es die möglichkeit auf den Namen der im Header steht zu klicken und dieser wird dann grau und man kann einen neuen namen eingeben.

---

### Counter View:

in dieser View hat man dann drei button einen für Plus, einen für Minus und einen für reset, der dann das geschpeicherte zurücksetzt (außer dem Namen).

- unter den Btn soll ein schieberegler sein der den täglichen Reset aktiviert bzw. deaktiviert.
- und da darunter soll man sehen wenn man die Liste zum letzten mal aktualisiert hat.

---

außen im mainView soll man auf den jeweiligen counter karten auch sehen ob der tägliche Reset aktiviert oder deeaktiviert wurde

---

# Design-Überlegungen

- es soll auf dem `main-view` im Header die Überschrift `Counter-App` und das plus sein
- der footer soll fix sein und nur der teil mit den counter-karten wenn sie mehrere werden zum scollen gehen.
- im `counter-view` soll der footer auch fix sein 


weitere Überlegung:
- es sollen im mainView auf den Counterkarten ganz rechts drei dots sein, wenn man auf diese klickt soll ein Kontexctmenü platzmäßig entwed3er nach unten oder nach oben geöffnet werden ion dem kommen mehrere optionen (umbenennen, reset anzeige auf die man tippen kann und der reset wird umgeschalten auf de- oder aktiviert, und ganz unten rot löschen, jeweils mit einem icon davor)