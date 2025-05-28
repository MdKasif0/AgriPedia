
import { config } from 'dotenv';
config();

import '@/ai/flows/identify-fruit-or-vegetable-from-image.ts';
import '@/ai/flows/validate-image-of-produce.ts';
import '@/ai/flows/generate-recipes-flow.ts';
import '@/ai/flows/generate-agri-tip-flow.ts';
import '@/ai/flows/chat-flow.ts'; // Added new chat flow
