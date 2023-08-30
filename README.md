# Facebook Chat Bot
## Overview
This Node.js project uses the [Unofficial Facebook Chat API](https://github.com/Schmavery/facebook-chat-api) and the [OpenAI API](https://platform.openai.com/docs/introduction) to run a ChatGPT style bot from a Facebook account.   

Read the documentation on the Unoffical Facebook Chat API to learn how to customize bot functionality beyond the scope of this project.

## Features
-ChatGPT style bot that can be added to multiple groups with unique tracking

-DALL·E 2 style image generation in Facebook chat

-Simple calculator 

-Cat balloon calculator [(see below for details)](#cat-balloon-altitude-estimator)

## Installation
To get started, clone the repository and install the dependencies.

`git clone https://github.com/castey/facebook-chat-bot.git`

`cd facebook-chat-bot`

`npm install`

### Create a .env file in the root directory.

`FB_EMAIL=[your-facebook-email-address]`

`FB_PASSWORD=[your-facebook-password]`

`OPENAI_API_KEY=[your-openai-api-key]`

`BOT_NAME=[name]` - pick a name

`STAY_ON_FOR=5` - defines how many messages a bot will reply to in a single wake cycle

`COOLDOWN=10000`- defines the cooldown time for a bot sending replies during a wake cycle

## Usage
To start the bot, run:

`node main.js`

From within a Faceook chat window:

`-pic [prompt]` creates and replies with an AI generated image

`@[name]` tagging the bot account will trigger a wake cycle

`-math [expression]` calculator

`-cat [number]` calculates how high a cat will go if N number of balloons were tied to it

## Dependencies

-dotenv

-openai

-axios

-fs

-facebook-chat-api

-puppeteer

## Screenshots

![Example Image](AIpics/pic.png)
![Example Image](AIpics/bot.png)

## Side Notes

Using the image generation feature `-pic` saves the generated image to the AIpics subdirectory. 

You will need to have [Node.js®](https://nodejs.org/en) installed.

# CAT BALLOON ALTITUDE ESTIMATOR

This function estimates the maximum altitude a cat can reach when tied to a specified number of balloons filled with air. It uses principles from the ideal gas law and buoyancy in conjunction with the barometric formula for altitude-dependent properties of the atmosphere.

## Constants

- \( R_{\text{ideal}} \) (8.31446 J/(K*mol)): The ideal gas constant.
- \( M_{\text{air}} \) (0.028964 kg/mol): The molar mass of dry air.
- \( T_{\text{sea level}} \) (288.15 K): Standard temperature at sea level.
- \( P_{\text{sea level}} \) (101325 Pa): Standard atmospheric pressure at sea level.
- \( g \) (9.80665 m/s^2): Acceleration due to gravity.
- \( V_{\text{balloon}} \) (0.0121 m^3): Volume of a single balloon.
- \( \text{CAT\_WEIGHT} \) (4.5 kg): Average weight of the cat.

## Algorithm

1. **Input Validation**:
    - Check if the input `bInput` is a valid number. If not, return a humorous message.

2. **Initial Computations**:
    - Calculate the total volume of balloons using:
    \[ V_{\text{total balloons}} = \text{bInput} \times V_{\text{balloon}} \]

3. **Buoyancy Calculation**:
    - For each altitude `h` from 0 to 100,000 meters (in steps of 1 meter), perform the following calculations:

    ### a. Temperature Calculation
      - Compute the current temperature using the lapse rate:
      \[ T_{\text{current}} = T_{\text{sea level}} - 6.5 \times 10^{-3} \times h \]

    ### b. Pressure Calculation
      - Compute the current pressure using the barometric formula:
      \[ P_{\text{current}} = P_{\text{sea level}} \times \left( \frac{T_{\text{current}}}{T_{\text{sea level}}} \right)^{\frac{-g \times M_{\text{air}}}{R_{\text{ideal}} \times -6.5 \times 10^{-3}}} \]

    ### c. Density Calculation
      - Calculate the density of the air:
      \[ \rho = \frac{P_{\text{current}} \times M_{\text{air}}}{R_{\text{ideal}} \times T_{\text{current}}} \]

    ### d. Buoyant Force Calculation
      - Calculate the buoyant force from the balloons only:
      \[ F_{\text{buoyancy balloons}} = \rho \times V_{\text{total balloons}} \times g \]

    ### e. Net Buoyant Force
      - Compute the net buoyant force after considering the cat's weight:
      \[ F_{\text{net}} = F_{\text{buoyancy balloons}} - \text{CAT\_WEIGHT} \times g \]

    ### f. Altitude Break Check
      - If \( F_{\text{net}} \) becomes non-positive, break the loop.

4. **Result Computation**:
    - Convert the last altitude in meters to feet.
    - Return a message depending on whether the cat reached the Karman Line (boundary of space) or not.

## Note

This is a theoretical computation. It assumes constant balloon volume and doesn't account for practical factors like balloon bursting at higher altitudes, temperature effects on balloon material, air currents, and other real-world conditions. Always prioritize the safety and well-being of animals. This computation is for entertainment and educational purposes only.
 
## License
Idk I'm not a lawyer but like you can use it or whatever. Just give credit because that's nice, please 🥹.

## Contributing
Pull requests are welcome!

