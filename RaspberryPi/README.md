# Raspberry Pi

## Funktion
Der RaspberryPi ist die zentrale Steuereinheit des Systems und koordiniert die Schnitzeljagd.

Er verbindet sich über WLAN mit dem Netzwerk "Fossa-Funk" und startet automatisch einen Mqtt Broker (TCP und MQTT), einen Http-Server für den Audiostream, sowie einen Http-Server für das Interface.
Dieses gibt den Pflegern Zugang zu diversen Einstellungs-, Steuerungs- und Informationsmöglichkeiten.
Das Backend berechnet eigenständig die Jagdzeiten, wählt eine zufällige Reihenfolge der Lockstationen aus und sendet die entsprechenden Steuerungsbefehle über MQTT an die Lockstationen, bzw. den Feeder.

Darüber hinaus findet eine Analyse von stereotypischem Verhalten in Form einer Heatmap statt.

## Aufbau
Das Interface besteht aus folgenden Komponenten
* [Raspberry Pi 3 (Model B+) mit WLAN](https://www.amazon.de/gp/product/B071JR9WS9/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1)
* [7’ LCD Touchscreen Display](https://www.amazon.de/gp/product/B008AESDSY/ref=oh_aui_detailpage_o01_s00?ie=UTF8&psc=1)
* Micro USB Netzteil (2x)

## Installation
###OS Raspbian Stretch mit Desktop###
[Raspbian Stretch](https://www.raspberrypi.org/downloads/raspbian/
) auf eine 32 GB Karte installieren

###Grundeinstellungen###
``` sudo raspi-config ```

→ Expand Filesystem

→ Change User Password

→ Enable Camera

→ Deutsche Tastatureinstellungen

→ Zeitzone Berlin

→ Wifi Country

###Wlan einrichten###
``` sudo nano /etc/wpa_supplicant/wpa_supplicant.conf ```
```
network={
ssid="Fossa-Funk"
psk="miauzgenau"
}
```

**System Uhrzeit von automatisch auf manuell umstellen**
``` hwclock –systohc ```

**[Samba](https://www.raspberrypi.org/magpi/samba-file-server/) installieren**
``` sudo apt-get update ```
``` sudo apt-get upgrade ```
``` sudo apt-get install samba samba-common-bin ```
``` sudo mkdir -m 1777 /share ```
``` sudo nano /etc/samba/smb.conf ```
``` 
[share]
Comment = Pi shared folder
Path = /share
Browseable = yes
Writeable = Yes
only guest = no
create mask = 0777
directory mask = 0777
Public = yes
Guest ok = yes
```
``` sudo smbpasswd -a pi ```
``` sudo /etc/init.d/samba restart ```

**[OpenCV](https://opencv.org/releases.html) installieren**
``` sudo apt-get update && sudo apt-get upgrade ```
``` sudo apt-get install build-essential libgdk-pixbuf2.0-dev libpango1.0-dev libcairo2-dev git cmake pkg-config libjpeg8-dev libjasper-dev libpng12-dev libavcodec-dev libavformat-dev libswscale-dev libv4l-dev libgtk2.0-dev libatlas-base-dev gfortran -y
git clone https://github.com/Itseez/opencv.git && cd opencv && git checkout 3.0.0
 ```
``` sudo apt-get install python2.7-dev ```
``` cd ~ && wget https://bootstrap.pypa.io/get-pip.py && sudo python get-pip.py ```
``` pip install numpy ```
``` cd ~/opencv && mkdir build && cd build ```
``` cmake -D CMAKE_BUILD_TYPE=RELEASE \ -D CMAKE_INSTALL_PREFIX=/usr/local \ -D INSTALL_PYTHON_EXAMPLES=ON \ -D INSTALL_C_EXAMPLES=ON \ -D OPENCV_EXTRA_MODULES_PATH=~/opencv_contrib/modules \ -D BUILD_EXAMPLES=ON .. ```
``` make -j4 ```
``` sudo make install && sudo ldconfig ```

**[Timelapse Motion Heatmap](https://github.com/LINKIWI/time-lapse-motion-heatmap) installieren**
``` pip install scipy ```
``` cd ~ && git clone https://github.com/LINKIWI/time-lapse-motion-heatmap ```

**[Node.js 10.x installieren](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) installieren**
``` curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash - ```
``` sudo apt-get install -y nodejs ```

**Http-server installieren**
``` npm install http-server -g ```

**Mosquitto installieren**
``` sudo apt-get install -y mosquitto mosquitto-clients ```
``` cd/etc/mosquitto ```
``` sudo nano mosquitto.conf ```
``` 
listener 1883
listener 1884
protocol websockets
```

## Nutzung

### Konfiguration
**Router anschließen und mit dem Wlan “Fossa-Funk” verbinden**
Wlan SSID und Passwort anpassen
Default: **Fossa-Funk** *miauzgenau*

**Über ssh mit dem Pi verbinden - ip Adresse 192.168.0.150**
Login: **pi** *fossa*
Mit Mac ```ssh pi@192.168.0.150```
Mit Windows das Programm Putty verwenden

**Audio Stream starten**
``` cd ~/share/audioStream ```
``` http-server -p 3000 ```
→ Im Browser unter der Adresse 192.168.0.150:3000/Sichelschnabelvanga.mp3 müsste jetzt das .mp3 file abgespielt werden.
⚠ Das Fenster solange offen lassen wie das System laufen soll. Für weitere Befehle auf dem Pi eine neue Session/neues Consolenfenster öffnen.

**Datum und Uhrzeit einstellen**
``` sudo date MMDDhhmmYY ``` ( zB 0630122918 )
→ Bei dem Befehl “date” müsste nun die aktuelle Uhrzeit und Datum ausgegeben werden

**Frontend starten**
``` cd ~/share/PaceBreakerFrontend ```
``` http-server ```
→ Im Browser unter der Adresse 192.168.0.150:8080 müsste nun das User Interface erreichbar sein
⚠ Das Fenster solange offen lassen wie das System laufen soll. Für weitere Befehle auf dem Pi eine neue Session/neues Consolenfenster öffnen.

**Backend starten**
``` cd ~/share/NodeFeedingTimer ```
``` node UserInterface.js ```
→ Müsste auf die Befehle vom UserInterface (192.168.0.150:8080) reagieren und eine Session starten
⚠ Das Fenster solange offen lassen wie das System laufen soll. Für weitere Befehle auf dem Pi eine neue Session/neues Consolenfenster öffnen.

**MQTT Broker**
Es wird automatisch ein MQTT Broker gestartet
TCP Default: **192.168.0.150:1883**
WS Default: **192.168.0.150:1884**


### Befehle
**Schnitzeljagd starten**
Die Schnitzeljagd kann über das Interface, erreichbar im Browser unter 192.168.0.150:8080 gestartet werden.

**Heatmap generieren**
Zur Erstellung einer Heatmap werden mindestens 20 Bilder benötigt.
``` source ~/.profile ```
``` workon cv ```
``` cd ~/share/Heatmap ```
``` python generateHeatmap.py ```

## To-Do
* Automatisierung HTTP-Server
* Automatisierung Heatmap Generierung
	* Foto Auslöse Routine schreiben
	* Heatmap Generierung Routine
	* Alte Fotos löschen Routine
* Interface aufmotzen
* Systemuhrzeit mit einem RealTimeClock Modul speichern