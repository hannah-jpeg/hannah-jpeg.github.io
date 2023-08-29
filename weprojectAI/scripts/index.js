// const axios = require("axios");

/*========================================================================
FORM FOR API
========================================================================*/

    // API input variables
    const apiForm = document.getElementById("api-form");
    const apiInput = document.getElementById("api-input");
    const apiSubmit = document.getElementById("api-submit");
    let apiKey;
    let introMessage;

    /*----------------------------------
        * Show chat form, hide API form
    ----------------------------------*/
    function enableChatForm() {
        chatForm.style.display = "flex"; // display the chat form
        apiForm.style.display = "none"; // hide the api form

        /***************************************************
1*      * TODO: Adjust the 'introMessage' from chatbot
        * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        * This is the first message the chatbot sends to user.
        ****************************************************/
        // Message from chatbot once API key is submitted.
        introMessage = "Hi, I'm a robot dedicated to telling you the best arguments to run in a debate.";

        // Display chatbot's intro message on screen
        messages.innerHTML +=
            `<div class="message bot-message">
                <img src="./icons/robot.png" alt="bot icon">
                <span class="bot-chatbubble round-rect">
                    ${introMessage}
                </span>
            </div>`;
    }

    /*----------------------------------
        * Reset API and chat forms
    ----------------------------------*/
    function resetForms() {
        apiInput.value = "";
        chatInput.value = "";
        messages.innerHTML = ""; // display nothing on screen
        chatForm.style.display = "none"; // hide the chat form
        apiForm.style.display = "flex"; // display the api form
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    EVENT LISTENER FOR API
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        (1) Waits for API key to be submitted (i.e., user presses enter or "submit" button)
        (2) Shows the chatbox
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    apiForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        apiKey = apiInput.value.trim(); // remove extra spaces, periods, etc. from front and back of API key
        // Assuming the API key is valid, enable chat form
        enableChatForm();
    });

/*========================================================================
FORM FOR CHATBOT
========================================================================*/

    // Chatbot input variables
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const messages = document.getElementById("chat-messages");

    /*----------------------------------
        * Display typing (...) chatbot message
    ----------------------------------*/
    function showTypingIndicator() {
        // Display (...) on screen
        messages.innerHTML +=
            `<div class="message bot-message typing-indicator">
                <img src="./icons/robot.png" alt="bot icon">
                    <span class="bot-chatbubble round-rect">
                        Typing ...
                    </span>
            </div>`;
    }

    /*----------------------------------
        * Hide typing (...) chatbot message
    ----------------------------------*/
    function hideTypingIndicator() {
        const typingIndicator = document.querySelector(".typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    EVENT LISTENER FOR API
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        (1) Waits for message to be submitted (i.e., user presses enter or "send" button)
        (2) Sends message to OpenAI API
        (3) Sends a response message from OpenAI API
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value; // User's input

        /***************************************************
2*      * TODO: Adjust the user's message to chatbot
        * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        * ^ This is optional if you change the configuration of the chatbot below!
        * Add information to the quotes ("").
        * Example: "The food is: " + userMessage + "Please provide"...
        ***************************************************/
        const inputPrompt = "" + userMessage + "";

        // Reset to blank user input to wait for next message
        chatInput.value = "";

        // Display user's message on screen
        messages.innerHTML +=
            `<div class="message user-message">
                <span class="user-chatbubble round-rect">
                    ${userMessage}
                </span>
                <img src="./icons/human.png" alt="user icon">
            </div>`;

        try {

            showTypingIndicator();

            /***************************************************
3*          * TODO: Adjust the configuration of** chatbot
            * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            * Adjust the "format" and "botRole".
            * format = HTML you want it to be structured as
            ***************************************************/

                const debateFormat = `
                    TH = This House.
                    The proposition, sometimes called government, supports the house, and the opposition is against the house.
                    THW = TH would
                    THP = TH prefers
                    THR = TH regrets
                    THS = TH supports
                    THBT = TH believes that
                    THO = TH opposes
                    ...
                `
                const format = `
                    <h1> // Proposition </h1>
                    <ol>
                        <li> //argument 1 </li>
                        <li> //argument 2 </li>
                        <li> //argument 3 </li>
                    </ol>
                    <h1> // Opposition </h1>
                        <ol>
                        <li> //argument 1 </li>
                        <li> //argument 2 </li>
                        <li> //argument 3 </li>
                    </ol>
                `;
                const botRole = `"You will be provided a debate topic. Information about debate motions (topic) here:`+ debateFormat +`. provide 3 of the best proposition (government) arguments and 3 of the best opposition arguments in this format:` + format + `Once the 3 arguments per side have been given, answer any follow-questions the user has related to this specific motion."`;

                // Use node.js axios library to make a POST request to the OpenAI API
                const response = await axios.post(
                    "https://api.openai.com/v1/chat/completions", {
                        messages: [
                            { role: "system", content: botRole },
                            { role: "user", content: inputPrompt },
                        ],
                        model: "gpt-3.5-turbo", // Use the ChatGPT 3.5 model
                        temperature: 0,
                        max_tokens: 512,
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );

                // Set chatbot response as what was sent back from OpenAI API
                const chatbotResponse = response.data.choices[0].message.content;

            hideTypingIndicator();

            // Display chatbot's message on screen
            messages.innerHTML +=
                `<div class="message bot-message">
                    <img src="./icons/robot.png" alt="bot icon">
                    <span class="bot-chatbubble round-rect">
                        ${chatbotResponse}
                    </span>
                </div>`;

        } catch (error) { // OpenAI API could not be reached!!!

            hideTypingIndicator();

            const errorMessage = "Invalid API key. Please try again in a few seconds.";

            // Display chatbot's error message on screen
            messages.innerHTML +=
                `<div class="message bot-message">
                    <img src="./icons/robot.png" alt="bot icon">
                    <span class="bot-chatbubble round-rect">
                        ${errorMessage}
                    </span>
                </div>`;

            // Display message in terminal
            console.error(error);

            // Reset everything after waiting 3000 ms
            setTimeout(resetForms, 3000);
        }
    });
