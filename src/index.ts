import { TelegramBot, TelegramUpdate } from './telegram';
import { BotHandler, Env } from './handlers';
import { ApiHandler } from './api';

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        if (request.method === 'GET' && url.pathname === '/api/bible') {
            const book = url.searchParams.get('book') || 'Kej';
            const chapter = url.searchParams.get('chapter') || '1';
            const version = url.searchParams.get('version') || 'AYT';
            
            try {
                const { results } = await env.DB.prepare(
                    "SELECT * FROM bible_verses WHERE book = ? AND chapter = ? AND translation = ? ORDER BY verse ASC"
                ).bind(book, chapter, version).all();

                return new Response(JSON.stringify(results || []), {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch (error: any) {
                console.error('Fetch Bible Verses Error:', error);
                return new Response(JSON.stringify({ error: error.message }), { 
                    status: 500, 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*' 
                    } 
                });
            }
        }

        if (url.pathname.startsWith('/api')) {
            const api = new ApiHandler(env);
            return api.handleRequest(request);
        }

        if (request.method === 'POST' && url.pathname === '/webhook') {
            try {
                const update: TelegramUpdate = await request.json();
                const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN);
                const handler = new BotHandler(bot, env);
                
                ctx.waitUntil(handler.handleUpdate(update));
                
                return new Response('OK', { status: 200 });
            } catch (error) {
                console.error('Webhook Processing Error:', error);
                return new Response('Internal Server Error', { status: 500 });
            }
        }

        if (request.method === 'GET' && url.pathname === '/setWebhook') {
            const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN);
            const webhookUrl = `${url.origin}/webhook`;
            await bot.setWebhook(webhookUrl);
            return new Response(`Webhook configured successfully to: ${webhookUrl}`, { status: 200 });
        }

        return new Response('BibleonBot Engine is running smoothly.', { status: 200 });
    }
};