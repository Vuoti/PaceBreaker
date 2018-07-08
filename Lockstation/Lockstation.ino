#include <WiFi.h>
#include <PubSubClient.h>

#include "AudioFileSourceICYStream.h"
#include "AudioFileSourceBuffer.h"
#include "AudioGeneratorMP3.h"
#include "AudioOutputI2SNoDAC.h"

const char* lockstationNr = "lockstation1/";
bool stationIsActive = false;

// Build in LED
int builtinLED = 2;
  
// PIR sensor 
int pirInputPin = 2;               // choose the input pin (for PIR sensor)
int pirState = LOW;             // we start, assuming no motion detected
 
// Wifi Config
char* ssid[] = {"Fossa-Funk", "ANDRE", "Zentrum der Macht"};
char* password[] = {"miauzgenau", "ichwillinsinternet", "ichwillinsinternet"};

// MQTT Config
//const char* mqtt_server = "test.mosquitto.org";
const char* mqtt_server = "192.168.0.150";
int mqtt_port = 1883;
char* mqtt_Subs[] = {"lockstation1/active", "lockstation1/playSound", "lockstation1/stopSound", "lockstation1/url", "lockstation1/isAlive", "lockstation1/restart"};

// Audio Stream URL
//const char *URL="http://mp3.planetradio.de/planetradio/hqlivestream.mp3";
//char *URL="http://192.168.0.100/stream/birdsound_lowQ.mp3";
char *URL="http://192.168.0.150:3000/Sichelschnabelvanga.mp3";
//char *URL="http://st01.dlf.de/dlf/01/128/mp3/stream.mp3";
//const char *URL="http://www.orangefreesounds.com/wp-content/uploads/2018/03/Bird-noises.mp3"; //
long startStreamTimestamp = 0;

AudioGeneratorMP3 *mp3;
AudioFileSourceHTTPStream *file;
AudioFileSourceBuffer *buff;
AudioOutputI2SNoDAC *out;

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
long lastMsgPIR = 0;
long lastTimeHighPIR = 0;

char msg[50];
int wifiIndex = 0;


void setup_wifi() {
  delay(10);
  
  // Connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid[wifiIndex]);
  WiFi.begin(ssid[wifiIndex], password[wifiIndex]);

  // Give it some time to make sure it can connect
  long firstConnectionAttempt = millis();
  while ((WiFi.status() != WL_CONNECTED) && (millis() - firstConnectionAttempt < 10000 )) {
    delay(500);
    Serial.print(".");
  }
  
  if(WiFi.status() == WL_CONNECTED){
    randomSeed(micros());
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
  }else{
    Serial.println("");
    Serial.println("WiFi connection failed");
    // Next time attempt one of our other saved networks
    if (wifiIndex < (sizeof(ssid)/sizeof(char *))-1){
      wifiIndex++;
    }else {
      wifiIndex = 0;
    }
  }  
}



////////////////////
// MQTT functions //
////////////////////

// MQTT Incoming Message
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  
  if (strcmp(topic,"lockstation1/active")==0) {
    if (((char)payload[0] == 't') || ((char)payload[0] == 'T') || ((char)payload[0] == '1')) {
      stationIsActive = true;
      Serial.println("Station is active now");
      client.publish("lockstation1/debug", "lockstation1 is active now");
      startStream();
    }else{
      stationIsActive = false;
      stopStream();
      Serial.println("Station is not active anymore");      
      client.publish("lockstation1/debug", "lockstation1 is inactive now");
    }
  }
 
  if (strcmp(topic,"lockstation1/playSound")==0) {
    if (((char)payload[0] == 't') || ((char)payload[0] == 'T') || ((char)payload[0] == '1')) {
      startStream();
      Serial.println("Sound started playing");
      client.publish("lockstation1/debug", "Sound started playing");
    }else{
      stopStream();
      Serial.println("Sound stopped playing");
      client.publish("lockstation1/debug", "Sound stopped playing");      
    }
  }  

  if (strcmp(topic,"lockstation1/stopSound")==0) {
    if (((char)payload[0] == 't') || ((char)payload[0] == 'T') || ((char)payload[0] == '1')) {
      stopStream();
      Serial.println("Sound stopped playing");
      client.publish("lockstation1/debug", "Sound stopped playing"); 
    }
  }  
 
  if (strcmp(topic,"lockstation1/url")==0) {
    char urlTemp[length];
    for (int i=0;i<length;i++) {
      //Serial.print((char)payload[i]);
      urlTemp[i] = (char)payload[i];
    }
    Serial.println(urlTemp);
    client.publish("lockstation1/debug", urlTemp);
    URL = urlTemp;
  }

  if (strcmp(topic,"lockstation1/isAlive")==0) {
    if (((char)payload[0] == 't') || ((char)payload[0] == 'T') || ((char)payload[0] == '1')) {
        Serial.println("lockstation1 is still alive");
        client.publish("lockstation1/debug", "lockstation1 is still alive");
    }
  }

  if (strcmp(topic,"lockstation1/restart")==0) {
    if (((char)payload[0] == 't') || ((char)payload[0] == 'T') || ((char)payload[0] == '1')) {
        Serial.println("lockstation1 restarting now");
        client.publish("lockstation1/debug", "lockstation1 restarting now ... ");
        ESP.restart();
    }
  }
}

// MQTT Connection
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("lockstation1/debug", "lockstation1 is now connected");
      // ... and resubscribe
      for (int i = 0; i < sizeof(mqtt_Subs)/sizeof(char *); i++){
        client.subscribe(mqtt_Subs[i]);
      }
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}



/////////////////////////////
// MP3 Streaming Functions //
/////////////////////////////

// Called when a metadata event occurs (i.e. an ID3 tag, an ICY block, etc.
void MDCallback(void *cbData, const char *type, bool isUnicode, const char *string)
{
  const char *ptr = reinterpret_cast<const char *>(cbData);
  (void) isUnicode; // Punt this ball for now
  // Note that the type and string may be in PROGMEM, so copy them to RAM for printf
  char s1[32], s2[64];
  strncpy_P(s1, type, sizeof(s1));
  s1[sizeof(s1)-1]=0;
  strncpy_P(s2, string, sizeof(s2));
  s2[sizeof(s2)-1]=0;
  Serial.printf("METADATA(%s) '%s' = '%s'\n", ptr, s1, s2);
  Serial.flush();
}

// Called when there's a warning or error (like a buffer underflow or decode hiccup)
void StatusCallback(void *cbData, int code, const char *string)
{
  const char *ptr = reinterpret_cast<const char *>(cbData);
  // Note that the string may be in PROGMEM, so copy it to RAM for printf
  char s1[64];
  strncpy_P(s1, string, sizeof(s1));
  s1[sizeof(s1)-1]=0;
  Serial.printf("STATUS(%s) '%d' = '%s'\n", ptr, code, s1);
  Serial.flush();
}

void startStream() {
    Serial.println("mp3 stream started");
    startStreamTimestamp = millis();
    file = new AudioFileSourceHTTPStream(URL);
    /*
    file->RegisterMetadataCB(MDCallback, (void*)"HTTP");
    buff = new AudioFileSourceBuffer(file, 4096); // def 2048
    buff->RegisterStatusCB(StatusCallback, (void*)"buffer");
    out = new AudioOutputI2SNoDAC();
    mp3 = new AudioGeneratorMP3();
    mp3->RegisterStatusCB(StatusCallback, (void*)"mp3");
    mp3->begin(buff, out);
    */
    // Create a buffer using that stream
    buff = new AudioFileSourceBuffer(file, 4096);
    out = new AudioOutputI2SNoDAC();
    mp3 = new AudioGeneratorMP3();
    // Pass in the *buffer*, not the *http stream* to enable buffering
    mp3->begin(buff, out);
}

void stopStream() {
  Serial.println("mp3 stream stopped");
  if (mp3->isRunning()) {
    mp3->stop();
//    buff->close();
//    file->close();
//    delete mp3;
//    delete buff;
//    delete file;
//    mp3 = NULL;
  }
}

void setup() {
  pinMode(builtinLED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  pinMode(pirInputPin, INPUT_PULLDOWN);     // Initialize the BTN pin as an intput
   
  Serial.begin(115200);
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  // MP3 Setup Logic
  file = new AudioFileSourceHTTPStream(URL);
  file->RegisterMetadataCB(MDCallback, (void*)"HTTP");
  buff = new AudioFileSourceBuffer(file, 4096); // def 2048
  buff->RegisterStatusCB(StatusCallback, (void*)"buffer");
  out = new AudioOutputI2SNoDAC();
  mp3 = new AudioGeneratorMP3();
  mp3->RegisterStatusCB(StatusCallback, (void*)"mp3");
  // mp3->begin(buff, out); // don't start by default
}

void loop() {

  // Reset WIFI if not connected
  if(WiFi.status() != WL_CONNECTED){
    Serial.println("WiFi is not connected");
    setup_wifi();
  }
  // Reconnect MQTT if not connected
  else if (!client.connected()) {
    Serial.println("MQTT is not connected");
    reconnect();
  }
  client.loop();

  long now = millis();

  /* 
   *  Problem:
   * Der PIR Sensor setzt den Input Pin für ca 3-6 Sekunden auf HIGH wenn er eine Bewegung registriert.
   * Passiert dies kurz bevor die Station aktiviert wird, würde sie direkt zurückgeben, dass ein Tier davorsteht (da der PIN noch HIGH ist) - obwohl das nicht der Fall ist.
   * 
   * Kurzfristige Lösung: Softwareseitig schauen wann der PIR auslöst obwohl die Station inaktiv ist und diesen "falschen Alarm" ignorieren
   * Langfristige Lösung: MOSFET als Schalter für den PIR einbauen --> PIR bekommt erst Strom wenn die Lockstation aktiviert wird
   */ 

   // check if PIR is triggered while station is not active to avoid false alarm
  if (digitalRead(pirInputPin) == HIGH && !stationIsActive){
    lastTimeHighPIR = now;
  }

  // 
  if (stationIsActive){
    if (digitalRead(pirInputPin) == HIGH && now - lastMsgPIR > 6000 && now - lastTimeHighPIR > 6000){
      lastMsgPIR = now; // Notwendig damit "Motion detected" nicht jeden Loop cycle gepublished wird
      Serial.print("Publish message: ");
      Serial.println("Motion detected");
      client.publish("lockstation1/animalInFront", "true");
      stopStream();
      stationIsActive = false;
    }
    // unfortunately I did not find a loop option in the audio library, therefore this workaround
    if(now - startStreamTimestamp > 23000 ){ // Our audio File is 22 seconds long --> stop and start again after 23 seconds
      //stopStream();
      //delay(100);
      //startStream();
    }
  }

  // MP3 Stream Loop  
  static int lastms = 0;
  if (mp3->isRunning()) {
    //Serial.println(mp3.len);
    if (!mp3->loop()) mp3->stop();
  }
}
