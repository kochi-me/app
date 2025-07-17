#!/usr/bin/env node

import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function testHuggingFace() {
  const token = process.env.VITE_HF_TOKEN;
  
  if (!token || token === 'your-huggingface-token-here') {
    logWarning('Hugging Face token not configured');
    return false;
  }
  
  if (!token.startsWith('hf_')) {
    logError('Hugging Face token should start with "hf_"');
    return false;
  }
  
  try {
    const hf = new HfInference(token);
    
    // Try different models
    const models = [
      'facebook/blenderbot-400M-distill',
      'microsoft/DialoGPT-small',
      'gpt2'
    ];
    
    for (const model of models) {
      try {
        const result = await hf.textGeneration({
          model: model,
          inputs: 'Hello',
          parameters: { max_length: 50 }
        });
        
        logSuccess(`Hugging Face API key is valid (using ${model})`);
        return true;
      } catch (modelError) {
        continue;
      }
    }
    
    logError('Hugging Face API key is valid but no compatible models found');
    return false;
  } catch (error) {
    logError(`Hugging Face API error: ${error.message}`);
    return false;
  }
}

async function testGroq() {
  const apiKey = process.env.VITE_GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    logWarning('Groq API key not configured');
    return false;
  }
  
  if (!apiKey.startsWith('gsk_')) {
    logError('Groq API key should start with "gsk_"');
    return false;
  }
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 50
      })
    });
    
    if (response.ok) {
      logSuccess('Groq API key is valid');
      return true;
    } else {
      const errorData = await response.json();
      logError(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Groq API error: ${error.message}`);
    return false;
  }
}

async function testTogether() {
  const apiKey = process.env.VITE_TOGETHER_API_KEY;
  
  if (!apiKey || apiKey === 'your-together-api-key-here') {
    logWarning('Together AI API key not configured');
    return false;
  }
  
  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-8b-chat-hf',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 50
      })
    });
    
    if (response.ok) {
      logSuccess('Together AI API key is valid');
      return true;
    } else {
      const errorData = await response.json();
      logError(`Together AI API error: ${errorData.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Together AI API error: ${error.message}`);
    return false;
  }
}

async function testApiKeys() {
  log('🔑 Testing AI API Keys...', colors.cyan);
  console.log();
  
  const results = await Promise.allSettled([
    testHuggingFace(),
    testGroq(),
    testTogether()
  ]);
  
  const validKeys = results.filter(r => r.status === 'fulfilled' && r.value).length;
  
  console.log();
  if (validKeys === 0) {
    logError('No valid API keys found!');
    logInfo('Your chatbot will run in fallback mode.');
    logInfo('See AI_SETUP.md for instructions on getting free API keys.');
  } else {
    logSuccess(`Found ${validKeys} valid API key(s)`);
    logInfo('Your AI chatbot is ready to use!');
  }
  
  console.log();
  logInfo('Quick setup links:');
  console.log('• Hugging Face: https://huggingface.co/settings/tokens');
  console.log('• Groq: https://console.groq.com/keys');
  console.log('• Together AI: https://api.together.xyz/settings/api-keys');
}

testApiKeys();
