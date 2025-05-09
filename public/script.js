document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const fileUpload = document.getElementById('fileUpload');
    const fileName = document.getElementById('fileName');
    
    // Global variable to store the current file
    let currentFile = null;
    
    // Check API health on load
    checkApiHealth();

    // Function to check API health
    async function checkApiHealth() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            if (!data.apiConfigured) {
                addMessage('⚠️ The chatbot is not fully configured. Please ask the administrator to set up the API key.', false, 'warning-message');
            }
        } catch (error) {
            console.error('Health check failed:', error);
            addMessage('⚠️ Could not connect to the server. Please check if the server is running.', false, 'warning-message');
        }
    }

    // File upload event listener
    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            currentFile = file;
            fileName.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
            
            // If it's an image, show a preview
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const filePreviewHTML = `
                        <div class="file-attachment">
                            <img src="${e.target.result}" alt="Image preview" class="file-preview">
                            <div class="file-attachment-info">
                                <i class="fas fa-image"></i>
                                <span class="file-attachment-name">${file.name}</span>
                                <span class="file-attachment-size">${formatFileSize(file.size)}</span>
                            </div>
                        </div>
                    `;
                    addMessage(`I'll upload this image: ${filePreviewHTML}`, true);
                };
                reader.readAsDataURL(file);
            } else {
                // For non-image files
                let fileIcon = 'fa-file';
                if (file.name.endsWith('.pdf')) fileIcon = 'fa-file-pdf';
                else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) fileIcon = 'fa-file-word';
                else if (file.name.endsWith('.txt')) fileIcon = 'fa-file-alt';
                
                const fileInfoHTML = `
                    <div class="file-attachment">
                        <div class="file-attachment-info">
                            <i class="fas ${fileIcon}"></i>
                            <span class="file-attachment-name">${file.name}</span>
                            <span class="file-attachment-size">${formatFileSize(file.size)}</span>
                        </div>
                    </div>
                `;
                addMessage(`I'll upload this file: ${fileInfoHTML}`, true);
            }
        }
    });

    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // Function to add a message to the chat
    function addMessage(message, isUser = false, extraClass = '') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        
        if (isUser) {
            messageDiv.classList.add('user-message');
        } else {
            messageDiv.classList.add('bot-message');
        }
        
        if (extraClass) {
            messageDiv.classList.add(extraClass);
        }

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        // Process message text for code blocks
        let formattedMessage = message;
        
        // Check for markdown code blocks and format them
        formattedMessage = formatCodeBlocks(formattedMessage);
        
        messageContent.innerHTML = formattedMessage;
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Format code blocks in the message
    function formatCodeBlocks(text) {
        // Convert markdown code blocks to HTML
        let formattedText = text;
        
        // Replace triple backtick code blocks
        formattedText = formattedText.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, language, code) => {
            return `<pre><code class="${language}">${escapeHTML(code.trim())}</code></pre>`;
        });
        
        // Replace inline code with single backticks
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert line breaks to <br>
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        return formattedText;
    }

    // Escape HTML to prevent XSS
    function escapeHTML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Function to send message to the backend
    async function sendMessage(message) {
        try {
            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'bot-message');
            const loadingContent = document.createElement('div');
            loadingContent.classList.add('message-content');
            loadingContent.innerHTML = '<p><i class="fas fa-circle-notch fa-spin"></i> Thinking...</p>';
            loadingDiv.appendChild(loadingContent);
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Create form data if we have a file to upload
            let response;
            if (currentFile) {
                const formData = new FormData();
                formData.append('message', message);
                formData.append('file', currentFile);
                
                response = await fetch('/api/chat', {
                    method: 'POST',
                    body: formData
                });
                
                // Clear the current file after sending
                currentFile = null;
                fileName.textContent = '';
                fileUpload.value = '';
            } else {
                response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message }),
                });
            }

            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);

            const data = await response.json();
            
            if (!response.ok) {
                if (data.setup_required) {
                    addMessage('⚠️ The API key is not configured. Please ask the administrator to run the setup script.', false, 'warning-message');
                } else {
                    throw new Error(data.message || data.error || 'Unknown error');
                }
                return;
            }

            addMessage(data.reply);
        } catch (error) {
            console.error('Error:', error);
            addMessage(`❌ Error: ${error.message || 'Something went wrong. Please try again later.'}`, false, 'error-message');
        }
    }

    // Handle send button click
    sendBtn.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message || currentFile) {
            addMessage(message, true);
            userInput.value = '';
            sendMessage(message);
        }
    });

    // Handle Enter key press
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendBtn.click();
        }
    });

    // Adjust textarea height as user types
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    });

    // Focus on the input field when the page loads
    userInput.focus();
}); 