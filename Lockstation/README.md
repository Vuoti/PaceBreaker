# Lockstation

## Funktion
Der ESP verbindet sich über WLAN mit dem Netzwerk "Fossa-Funk" und erwartet über Mqtt Befehle. Die verschiedenen Lockstationen sind durchnummeriert und können entsprechend angesprochen werden. Durch einen Post in den Channel "lockstation0/active" mit der Message "true", wird zum Beispiel die erste Station scharf gestellt. Es wird nun der AudioStream gestartet und über den Lautsprecher ausgegeben. Gleichzeitig wird ab der Aktivierung der Output des Bewegungsmelders überwacht. Sobald eine Bewegung registriert wird stoppt der Sound und die Lockstation setzt über Mqtt das Backend auf dem RaspberryPi darüber in Kenntniss, dass das Tier vor der Station erkannt wurde.

## Aufbau
Eine Lockstation besteht aus folgenden Komponenten
* [ESP32 (Doit Dev Kit v1)](https://www.amazon.de/gp/product/B071JR9WS9/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1)
* [Pyroelectrische Infrarot Sensor (PIR Bewegungsmelder)](https://www.amazon.de/gp/product/B008AESDSY/ref=oh_aui_detailpage_o01_s00?ie=UTF8&psc=1)
* [Mono 2.5W Class D Audio Amplifier - PAM8302](https://www.amazon.de/gp/product/B00PY2YSI4/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1)
* [3W 8Ω Lautsprecher](https://www.amazon.de/gp/product/B078WQBDK4/ref=oh_aui_detailpage_o04_s00?ie=UTF8&psc=1)
* [Powerbank Anker PowerCore 5000mAh](https://www.amazon.de/gp/product/B01CU1EC6Y/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1)
* Jumper Wire
* Micro USB Kabel

SCHALTPLAN

## Nutzung

### Konfiguration
Wlan SSID und Passwort anpassen
Default: **Fossa-Funk** *miauzgenau*

IP des MQTT TCP Broker anpassen
Default: **192.168.0.150:1883**

Nummer der Lockstation angeben, derzeit mit Suchen und Ersetzen.
Suchen **"lockstation0"**, ersetzen **"lockstation1"**

#### MQTT Subscribe
| Topic                       | Value    | Description                                                   |
| --------------------------- | -------- | ------------------------------------------------------------- |
| lockstation0/active         | bool     | Aktiviert/Deaktiviert Sound und Bewegungsmelder |
| lockstation0/playSound      | bool     | Aktiviert/Deaktiviert Sound |
| lockstation0/stopSound      | false    | Deaktiviert Sound |
| lockstation0/url            | String   | Url zum AudioStream |
| lockstation0/isAlive        | true     | Station gibt ein Lebenszeichen von sich (lockstation#/debug) |
| lockstation0/restart        | true     | ESP startet neu |

#### MQTT Publish
| Topic                       | Value    | Description                                                   |
| --------------------------- | -------- | ------------------------------------------------------------- |
| lockstation0/animalInFront  | true     | Wenn die Station aktiv ist und eine Bewegung registriert |
| lockstation0/debug          | String   | Channel für allgemeine Statusmeldungen |

## To-Do
* OTA Updates auf den ESPs einrichten
* DeepSleep Funktion um Batterie zu sparen
* Stromversorgung des PIR Sensors nur bei "aktiver" Lockstation (z.B. mit einem MOSFET)
* Lauteren Sound
