# AI Setup Guide - Free Models

Your Kōchime AI Guide can use multiple free AI providers. Here's how to set them up:

## 🆓 **Free AI Providers (Recommended)**

### 1. **Hugging Face** (Primary - Completely Free)
- **What**: Access to thousands of open-source AI models
- **Cost**: Free with rate limits
- **Setup**:
  1. Go to [huggingface.co](https://huggingface.co)
  2. Create free account
  3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
  4. Create new token with "Read" permissions
  5. Add to `.env`: `VITE_HF_TOKEN=your-token-here`

### 2. **Groq** (Fast & Free)
- **What**: Ultra-fast inference with Llama models
- **Cost**: Free tier - 14,400 tokens/day
- **Setup**:
  1. Go to [console.groq.com](https://console.groq.com)
  2. Create free account
  3. Go to [API Keys](https://console.groq.com/keys)
  4. Create new API key
  5. Add to `.env`: `VITE_GROQ_API_KEY=your-key-here`

### 3. **Together AI** (Good Free Credits)
- **What**: Open-source models with good performance
- **Cost**: Free $25 credits (lasts months)
- **Setup**:
  1. Go to [together.ai](https://together.ai)
  2. Create free account
  3. Go to [API Keys](https://api.together.xyz/settings/api-keys)
  4. Create new API key
  5. Add to `.env`: `VITE_TOGETHER_API_KEY=your-key-here`

## 🔧 **Quick Setup**

1. **Update your `.env` file**:
```env
# Get at least one of these (Hugging Face recommended)
VITE_HF_TOKEN=hf_your_token_here
VITE_GROQ_API_KEY=gsk_your_key_here
VITE_TOGETHER_API_KEY=your_key_here
```

2. **Test the setup**:
```bash
npm run dev
# Go to chat and ask: "Hello, how are you?"
```

## 🤖 **How It Works**

Your AI agent tries providers in this order:
1. **Hugging Face** (DialoGPT-medium) - Conversational AI
2. **Groq** (Llama3-8b) - Fast, high-quality responses
3. **Together AI** (Llama3-8b) - Reliable backup
4. **Fallback** - Rule-based responses if all fail

## 💡 **Tips for Best Results**

### Cost Optimization:
- **Hugging Face**: Completely free, great for development
- **Groq**: 14,400 tokens/day = ~200-300 conversations
- **Together AI**: $25 credits = thousands of messages

### Performance:
- **Fastest**: Groq (sub-second responses)
- **Most Reliable**: Hugging Face (always available)
- **Best Quality**: Together AI (more sophisticated models)

### Usage Patterns:
- **Development**: Use Hugging Face only
- **Demo/Testing**: Add Groq for speed
- **Production**: Use all three for redundancy

## 🛠 **Advanced Configuration**

### Custom Models:
Edit `src/utils/aiAgent.js` to change models:
```javascript
// Hugging Face models
'microsoft/DialoGPT-medium',     // Conversational
'facebook/blenderbot-400M-distill', // Friendly
'HuggingFaceH4/zephyr-7b-beta'   // Instruction-following
```

### Response Tuning:
Adjust parameters in `aiAgent.js`:
```javascript
parameters: {
  max_length: 150,      // Response length
  temperature: 0.7,     // Creativity (0.1-1.0)
  top_p: 0.9,          // Response focus
  repetition_penalty: 1.1 // Avoid repetition
}
```

## 📊 **Usage Monitoring**

Check your usage:
- **Hugging Face**: [huggingface.co/usage](https://huggingface.co/usage)
- **Groq**: [console.groq.com/usage](https://console.groq.com/usage)
- **Together AI**: [together.ai/usage](https://together.ai/usage)

## 🔒 **Security Notes**

- Never commit API keys to git
- Use environment variables only
- Keys are client-side (for demo purposes)
- For production, move to server-side API

## 🆘 **Troubleshooting**

### "AI Provider: Fallback" showing?
- Check if API keys are set in `.env`
- Verify keys are valid
- Check browser console for errors

### Slow responses?
- Hugging Face can be slow during peak hours
- Groq is fastest (usually < 1 second)
- Add multiple providers for redundancy

### Rate limited?
- Hugging Face: Wait or use different model
- Groq: 14,400 tokens/day limit
- Together AI: Check credit balance

## 🎯 **Recommended Setup**

For best experience, get **all three** API keys:
1. **Hugging Face** - Primary (free forever)
2. **Groq** - Speed boost (14,400 tokens/day)
3. **Together AI** - Quality backup ($25 credits)

This gives you redundancy, speed, and high-quality responses while staying completely free for most use cases!
