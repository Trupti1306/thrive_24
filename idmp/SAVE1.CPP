#include <WiFi.h>
#include <WebServer.h>

// Define your WiFi credentials (optional, for connecting to a router)
const char* ssid = "MyDeviceAP"; // The ESP32 will create this Access Point
const char* password = "strongpassword"; // Password for the Access Point

WebServer server(80); // Create a server object on port 80

void setup() {
  // ... other initialization (GPS, GSM, etc.) ...

  // Set up the ESP32 as a Wi-Fi Access Point (AP)
  WiFi.softAP(ssid, password);
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());

  // Define the function that runs when a user visits the root address (e.g., 192.168.4.1)
  server.on("/", handleRoot);
  
  server.begin(); // Start the server
}

void loop() {
  server.handleClient(); // Must be called repeatedly to process client requests
  // ... rest of your loop logic ...
}