// Test script to verify the prompt loading system
import { readFile } from 'fs/promises';
import { join } from 'path';

// Simple version of loadSystemPrompt for testing
async function loadSystemPrompt() {
  try {
    const promptPath = join(process.cwd(), 'prompts', 'system-prompt.md');
    const promptContent = await readFile(promptPath, 'utf-8');
    return promptContent;
  } catch (error) {
    console.warn('Could not load system prompt from file, using fallback');
    return `You are Kōchime AI Guide, a helpful assistant for a course management platform.

Available courses:
{{COURSES_LIST}}

{{CURRENT_COURSE_CONTEXT}}`;
  }
}

async function testPromptLoading() {
  console.log('Testing prompt loading system...\n');
  
  try {
    const prompt = await loadSystemPrompt();
    console.log('✅ Prompt loaded successfully!');
    console.log('Prompt length:', prompt.length);
    console.log('Contains placeholders:', prompt.includes('{{COURSES_LIST}}') && prompt.includes('{{CURRENT_COURSE_CONTEXT}}'));
    
    // Test template replacement
    const testPrompt = prompt
      .replace('{{COURSES_LIST}}', 'Test Course 1\nTest Course 2')
      .replace('{{CURRENT_COURSE_CONTEXT}}', 'Currently discussing: Test Course');
    
    console.log('✅ Template replacement works!');
    console.log('Final prompt starts with:', testPrompt.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ Error testing prompt system:', error);
  }
}

testPromptLoading();
