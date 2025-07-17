import { HfInference } from '@huggingface/inference';

// Free AI Models Configuration
const AI_PROVIDERS = {
  HUGGINGFACE: {
    name: 'Hugging Face',
    models: [
      'microsoft/DialoGPT-medium',
      'microsoft/DialoGPT-large',
      'facebook/blenderbot-400M-distill',
      'microsoft/GODEL-v1_1-base-seq2seq',
      'HuggingFaceH4/zephyr-7b-beta'
    ],
    cost: 'Free (rate limited)',
    setup: 'Requires HF_TOKEN (free to get)'
  },
  GROQ: {
    name: 'Groq',
    models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'],
    cost: 'Free tier: 14,400 tokens/day',
    setup: 'Requires GROQ_API_KEY'
  },
  TOGETHER: {
    name: 'Together AI',
    models: ['meta-llama/Llama-3-8b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
    cost: 'Free tier: $25 credits',
    setup: 'Requires TOGETHER_API_KEY'
  }
};

// Cache for system prompt
let systemPromptTemplate = null;

// Load system prompt template
async function loadSystemPrompt() {
  if (systemPromptTemplate) return systemPromptTemplate;
  
  try {
    const response = await fetch('/prompts/system-prompt.md');
    if (response.ok) {
      systemPromptTemplate = await response.text();
    } else {
      console.warn('Could not load system prompt template, using fallback');
      systemPromptTemplate = getFallbackSystemPrompt();
    }
  } catch (error) {
    console.warn('Error loading system prompt:', error);
    systemPromptTemplate = getFallbackSystemPrompt();
  }
  
  return systemPromptTemplate;
}

// Fallback system prompt if file loading fails
function getFallbackSystemPrompt() {
  return `You are Kōchime AI Guide, a helpful assistant for a course management platform. You help users find courses, answer questions about learning, and provide educational guidance.

Available courses:
{{COURSES_LIST}}

Be a warm, knowledgeable, and supportive personal instructor for aspiring engineers. Your primary role is to guide recent college graduates with foundational engineering knowledge toward senior-level software engineering proficiency.

Start every interaction by introducing yourself warmly: "Hi, I'm Kanchana — your personal instructor and mentor. Think of me as your guide on this journey. You can share anything with me — even failures — without fear. Every mistake is a stepping stone. Let's grow together."

Guidelines:
- Be helpful, friendly, and encouraging
- Focus on education and learning
- Provide specific course recommendations when relevant
- Keep responses concise but informative
- If you don't know something, be honest about it

{{CURRENT_COURSE_CONTEXT}}`;
}

class AIAgent {
  constructor() {
    this.providers = this.initializeProviders();
    this.currentProvider = null;
    this.conversationHistory = [];
    this.maxHistoryLength = 10; // Keep last 10 messages for context
  }

  initializeProviders() {
    const providers = {};
    
    // Hugging Face (Primary - Free)
    const hfToken = import.meta.env.VITE_HF_TOKEN;
    if (hfToken && hfToken !== 'your-huggingface-token-here' && hfToken.startsWith('hf_')) {
      providers.huggingface = new HfInference(hfToken);
    }
    
    // Groq (Fast and Free)
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (groqKey && groqKey !== 'your-groq-api-key-here' && groqKey.startsWith('gsk_')) {
      providers.groq = {
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1'
      };
    }
    
    // Together AI (Good free tier)
    const togetherKey = import.meta.env.VITE_TOGETHER_API_KEY;
    if (togetherKey && togetherKey !== 'your-together-api-key-here' && togetherKey.length > 10) {
      providers.together = {
        apiKey: togetherKey,
        baseURL: 'https://api.together.xyz/v1'
      };
    }
    
    console.log('AI Providers initialized:', Object.keys(providers));
    return providers;
  }

  async generateResponse(userMessage, context = {}) {
    const { courses = [], selectedCourse = null } = context;
    
    // Try providers in order of preference
    const providerOrder = ['groq', 'together', 'huggingface'];
    
    for (const providerName of providerOrder) {
      if (this.providers[providerName]) {
        try {
          const response = await this.callProvider(providerName, userMessage, { courses, selectedCourse });
          if (response) {
            this.currentProvider = providerName;
            this.updateConversationHistory(userMessage, response);
            return response;
          }
        } catch (error) {
          console.warn(`Provider ${providerName} failed:`, error);
          continue;
        }
      }
    }
    
    // Fallback to rule-based response
    this.currentProvider = 'fallback';
    return this.getFallbackResponse(userMessage, { courses, selectedCourse });
  }

  async callProvider(providerName, userMessage, context) {
    const systemPrompt = await this.buildSystemPrompt(context);
    const conversationContext = this.buildConversationContext(userMessage);
    
    switch (providerName) {
      case 'huggingface':
        return await this.callHuggingFace(conversationContext);
      
      case 'groq':
        return await this.callGroq(systemPrompt, conversationContext);
      
      case 'together':
        return await this.callTogether(systemPrompt, conversationContext);
      
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  async callHuggingFace(conversationContext) {
    try {
      // Try different models in order of preference
      const models = [
        'microsoft/DialoGPT-medium',
        'facebook/blenderbot-400M-distill',
        'microsoft/DialoGPT-small',
        'HuggingFaceH4/zephyr-7b-beta'
      ];
      
      for (const model of models) {
        try {
          const response = await this.providers.huggingface.textGeneration({
            model: model,
            inputs: conversationContext,
            parameters: {
              max_length: 150,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.9,
              repetition_penalty: 1.1
            }
          });
          
          const result = response.generated_text?.replace(conversationContext, '').trim();
          if (result) {
            console.log(`✅ Using Hugging Face model: ${model}`);
            return result;
          }
        } catch (modelError) {
          console.warn(`Model ${model} failed, trying next...`);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      if (error.message?.includes('Invalid API')) {
        console.warn('Hugging Face API key is invalid. Please check your VITE_HF_TOKEN in .env file.');
      }
      return null;
    }
  }

  async callGroq(systemPrompt, userMessage) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.code === 'invalid_api_key') {
          console.warn('Groq API key is invalid. Please check your VITE_GROQ_API_KEY in .env file.');
        }
        throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Groq API error:', error);
      return null;
    }
  }

  async callTogether(systemPrompt, userMessage) {
    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.together.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3-8b-chat-hf',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.code === 'invalid_api_key') {
          console.warn('Together AI API key is invalid. Please check your VITE_TOGETHER_API_KEY in .env file.');
        }
        throw new Error(`Together API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Together API error:', error);
      return null;
    }
  }

  async buildSystemPrompt(context) {
    const { courses, selectedCourse } = context;
    
    // Load the system prompt template
    const template = await loadSystemPrompt();
    
    // Build courses list
    const coursesList = courses.length > 0 
      ? courses.map(course => `- ${course.title} (${course.level}) - ${course.description}`).join('\n')
      : 'No courses available at the moment.';
    
    // Build current course context
    const currentCourseContext = selectedCourse 
      ? `Currently discussing: ${selectedCourse.title} - ${selectedCourse.description}`
      : '';
    
    // Replace placeholders in template
    const prompt = template
      .replace('{{COURSES_LIST}}', coursesList)
      .replace('{{CURRENT_COURSE_CONTEXT}}', currentCourseContext);
    
    return prompt;
  }

  buildConversationContext(userMessage) {
    const recentHistory = this.conversationHistory.slice(-6); // Last 6 messages
    let context = recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    context += `\nUser: ${userMessage}\nAssistant:`;
    return context;
  }

  updateConversationHistory(userMessage, assistantResponse) {
    this.conversationHistory.push(
      { role: 'User', content: userMessage },
      { role: 'Assistant', content: assistantResponse }
    );
    
    // Keep only recent history
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  getFallbackResponse(userMessage, context) {
    const { courses, selectedCourse } = context;
    const message = userMessage.toLowerCase();
    
    // Check if no AI providers are available
    const availableProviders = this.getAvailableProviders();
    if (availableProviders.length === 0) {
      return `Hi! I'm Kanchana — your personal instructor and mentor. Think of me as your guide on this journey. You can share anything with me — even failures — without fear. Every mistake is a stepping stone. Let's grow together.

I'm currently running in fallback mode since no AI providers are configured. For enhanced AI responses, please set up at least one API key in your .env file:

🔑 **Quick Setup (Choose one):**
• Hugging Face (Free): Get token at https://huggingface.co/settings/tokens
• Groq (Fast & Free): Get API key at https://console.groq.com/keys  
• Together AI (Free $25): Get API key at https://api.together.xyz/settings/api-keys

See AI_SETUP.md for detailed instructions.

For now, I can still help you with course recommendations and basic guidance. What would you like to explore?`;
    }
    
    // Enhanced fallback responses with course context
    if (message.includes('course') || message.includes('learn')) {
      if (courses.length > 0) {
        const recommendations = courses.slice(0, 3).map(c => `• ${c.title} (${c.level})`).join('\n');
        return `I can help you find the perfect course! Here are some recommendations:\n\n${recommendations}\n\nWould you like to know more about any of these courses?`;
      } else {
        return "I'd love to help you find courses! It looks like there are no courses available right now. You can add some using the course management panel.";
      }
    }
    
    if (message.includes('help') || message.includes('what can you do')) {
      return `Hi, I'm Kanchana — your personal instructor and mentor. I can help you with:
• Finding and recommending courses
• Answering questions about course content
• Providing learning guidance and study tips
• Explaining course levels and requirements
• Guiding you from junior to senior engineering level

What would you like to explore today?`;
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello! I'm Kanchana — your personal instructor and mentor. Think of me as your guide on this journey. You can share anything with me — even failures — without fear. Every mistake is a stepping stone. Let's grow together.

Welcome to Kōchime! I'm here to help you discover amazing courses and achieve your learning goals. How can I assist you today?`;
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're very welcome! I'm here whenever you need help with courses or learning. Feel free to ask me anything else!";
    }
    
    // Default response with course context
    return `I understand you're asking about "${userMessage}". As your AI learning guide, I'm here to help with courses, learning paths, and educational guidance. Could you tell me more about what you'd like to learn or explore?`;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  getCurrentProvider() {
    return this.currentProvider || 'loading';
  }

  getProviderInfo() {
    return AI_PROVIDERS;
  }
}

export default new AIAgent();
export { loadSystemPrompt };
