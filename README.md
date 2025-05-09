# Sancho's Bot - Academic AI Assistant

A customized AI chatbot designed to support university students in computer science and other academic subjects.

## Features

- 💻 **Coding Help**: Assistance with Python, JavaScript, C++, and more
- 🧪 **Math Solutions**: Support for calculus, linear algebra, and discrete math
- 📚 **Study Planning**: Organization of assignments and exam preparation
- 🧠 **Research Aid**: Help with essays and academic research
- 📝 **Note Summarization**: Explaining and condensing complex notes
- ⚙️ **Project Assistance**: Guidance for databases, APIs, and system architecture

## Setup Instructions

### Prerequisites

- Node.js (version 14.x or higher)
- An OpenAI API key

### Quick Start

The easiest way to get started is to use our launcher script:

```
npm run launcher
```

This interactive script will:
1. Check if your environment is configured
2. Run the setup if needed
3. Let you choose between production or development mode
4. Start the server automatically

### Manual Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/sanchos-bot.git
   cd sanchos-bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the setup script to configure your environment:
   ```
   npm run setup
   ```

4. Start the server:
   ```
   npm start       # For production
   npm run dev     # For development with auto-reload
   ```

5. Access the chatbot by opening your browser and navigating to:
   ```
   http://localhost:3000
   ```

## Usage

Simply type your questions or requests into the chat interface. Sancho's Bot can help with:

- Debugging code snippets
- Explaining academic concepts
- Creating study plans
- Solving mathematical problems
- Assisting with research projects
- And much more!

## Maintenance

### Testing

To verify that your OpenAI API integration is working correctly:

```
npm test
```

### Updating

To update your bot's dependencies or reconfigure settings:

```
npm run update
```

This interactive script allows you to:
- Update npm dependencies
- Reconfigure your OpenAI API key
- Check for system updates and file integrity

## Technologies Used

- Node.js and Express.js for the backend
- OpenAI API for the AI chat functionality
- HTML, CSS, and JavaScript for the frontend
- Font Awesome for icons

## License

MIT

## Acknowledgements

- OpenAI for providing the AI capabilities
- The developers of Node.js, Express, and other open-source technologies used in this project 