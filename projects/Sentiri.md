# Sentiri

## Problem
Explored possible solutions for assiting the navigation experience for the visually impaired.  
Millions of people are unable to navigate new spaces that are not familiar in a comfortable manner.  
How could we apply technology to act as a guide?

## Solution
There were 2 phases to solve this problem:

Phase 1:
Created a 3D printed headband that consisted of a series of modules each with an IR sensor and coincell motor.  
All connected to an MCU with BLE and mobile application. The devices sent vibrations to steer a user of  
inform the user of obsticles to avoid. Conducted a UX study with 15+ users that attempted to navigate an makeshift  
maze of walls while blindfolded.

Phase 2:
Created a mobile application in conjunction with the Bridge Engine to allow the user to  
wear the mobile device around their neck. Created a werable with vibration motors attached  
in a 360 coverage connected to the mobile device via BLE. The wearable acted as haptic  
feedback system to let the user "feel" where to go without taking from the other senses.  
Created a virtual guide system that would do path finding in the vitural space and guide  
the user when aligned to the real world.

## Technologies
* 3D printing
* Electronics hardware design
* Mobile Devices
* Structure Sensor + Bridge Engine

## Programming Languages
Phase 1:
* Objective-c (iOS mobile app to control headband and visualize data)
* C++ (firmware)

Phase 2:
* Swift (bridge engine application)
* C++ (firmware)

## Team
* Matt Murray

## Contributions
* overall concept, UX and UI
* designed and created the headband hardware (Phase 1 and 2)
* created mobile application and BLE integration (Phase 1 and 2)


## References
* [Media](https://www.engadget.com/2015/11/20/headband-detects-obstacles-and-guides-the-blind-haptically/)
* [Video](https://vimeo.com/144912610)