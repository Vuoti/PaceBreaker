# Backend

## Funktion
Das Backend wird auf dem Raspberry Pi am Pflegerinterface ausgeführt und verbindet alle technischen Komponenten des PaceBreaker Systems miteinander.
Es ist für die Ausführung und Koordination der Jagten verantwortlich und stellt im Rahmen der Jagten eine Brücke zwischen dem Anwender außerhalb des Geheges (Pfleger) und dem Anwender innerhalb des Geheges (Raubtier) dar.
Im Folgenden wird der grundlegende Ablauf hier von erläutert und Bezug auf die Struktur die verwendeten Dateien genommen.

## Grundlegende Daten
- Das Backend wurde in Javascript/Node.js (Version 10) geschrieben
- Für die Kommunikation mit dem Frontend (Pfleger Interface, Besucheranzeige) wurde MQTT verwendet
- Innerhalb einiger Javascript Dateien werden andere Scripte über Kommandozeilenbefehle gestartet/ausgeführt (mittels eines Node-Moduls)

## Ausführen
Um das Backend zu nutzen, bitte den folgenden Schritten folgen:
1. MQTT Broker starten und Port und Url in *Connections.js* eintragen
2. *UserInterface.js* mit Node.js ausführen
3. Das Backend ist nun aktiv. Bitte das Frontend verwenden um das PaceBreaker System zu verwenden.

## Struktur
Das Backend basiert auf den folgenden Files:


| Filename              		| Funktionen    |
| ----------------------------- | ------------- |
| UserInterface.js | Code der händisch (oder im Autostart) gestartet werden muss. Startet, wenn vom Frontend dazu aufgefordert, die Main.js und übergibt ihr die vom Pfleger eingestellten (und per MQTT empfangenen) Werte als Arguments. |
| Main.js    		| Hauptcode. Erstellt die Jagt Sessions anhand der ihr übergebenen Arguments und führt diese über das Session-Callback aus.   |
| Session.js  |  Definiert wie eine Jagt-Session und die Sammlung von mehreren Sessions über einen Tag hinweg (Daily-Session) funktioniert. Wenn eine Jagt-Session beginnt, ruft diese das Callback auf, welches in Main.js definiert, wie die Jagt ablaufen soll. |
| Lockstation.js | Bestimmt wie über MQTT mit einer Lockstation kommuniziert werden kann.  |
| Feeder.js  |  Bestimmt wie über MQTT mit dem Feeder kommuniziert werden kann. |
| Connections.js  |  Übernimmt alle weiteren Aufgaben, die mit MQTT zu tun haben. Unter anderem: welche Topics subscribed werden sollen und wie die URL des Brokers lautet. |
| Tools.js  |  Helferfunktionen. U.A.Funktionen für Umrechnungen und Kalkulationen |
| Alles Weitere  |  Nicht in Verwendung. |


Die Funktionen und Klassen in den Files sind allesamt in module.exports gebündelt, so dass sie über require-Statements auf einander zugreifen können.

## Klassen / Vokabular
Innerhalb des Codes werden einige Begriffe verwendet, die ohne Erklärung erst Mal wenig Sinn ergeben. Sie wurden vom Team geschaffen um Profs und Neugierige zu verwirren. Aus Gnade ist hier die Erläuterung:

### Session
**Bedeutet:** Jagt durch das Tiergehege.<br>
**Umfasst:** Einstellungen; Anzahl erreichter Stationen; Anzahl nicht pünktlich erreichter Stationen; Aktiv?; Welche Station ist gerade aktiv?; Main-Loop

### SessionSettings
**Bedeutet:** Einstellungen für eine Session<br>
**Umfasst:** Wie viele Stationen werden genutzt?; Wie viele Stationen muss das Tier erreichen?; In welcher Reihenfolge?; Wie viel Zeit darf zwischen dem Erreichen von zwei Stationen vergehen?; Welcher Sound soll von der Station abgespielt werden?

### DailySession
**Bedeutet:** Ansammlung von mehreren Jagten über einen Zeitraum von maximal 24 Stunden<br>
**Umfasst:** Einstellungen; Welche Session wird ausgeführt?; Wann werden Sessions ausgeführt?; Gesamtanzahl erreichter Stationen; Gesamtanzahl nicht pünktlich erreichter Stationen; Aktiv?

### DailySessionSettings
**Bedeutet:** Einstellungen für eine DailySession<br>
**Umfasst:** Startzeit (Ab wie viel Uhr?); Endzeit (Bis wie viel Uhr?); Pausezeiten (jeweils 30 Minuten länge); Wie viele Sessions soll es geben?

## Bugs & ToDos
Momentan wird bei vier verbundenen Lockstationen der Feeder zeitgeleich mit der vierten Station aktiv gesetzt, so dass die vierte Station im Wesentlichen nicht verwendet wird. Dies hängt vermutlich mit einem Fehler im For-Loop des Session Callbacks zusammen.
