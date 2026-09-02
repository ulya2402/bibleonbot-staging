import { TelegramBot } from './telegram';

export class ApiHandler {
    env: any;
    constructor(env: any) { this.env = env; }

    async handleRequest(request: Request): Promise<Response> {
        const url = new URL(request.url);
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };

        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        // 1. GET HOME DATA
        if (request.method === 'GET' && url.pathname === '/api/home') {
            try {
                const dailyVerse = await this.env.DB.prepare("SELECT * FROM daily_verse WHERE id = 1").first();
                const news = await this.env.DB.prepare("SELECT * FROM news ORDER BY id DESC LIMIT 50").all();
                const communities = await this.env.DB.prepare("SELECT * FROM communities WHERE is_channel = 0 ORDER BY id DESC LIMIT 50").all();
                const channels = await this.env.DB.prepare("SELECT * FROM communities WHERE is_channel = 1 ORDER BY id DESC LIMIT 50").all();
                return new Response(JSON.stringify({
                    dailyVerse: { verse_reference: dailyVerse?.reference || 'Yohanes 3:16', verse_text: dailyVerse?.text || 'Ayat belum diatur.' },
                    news: news.results || [], communities: communities.results || [], channels: channels.results || []
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
            } catch (error: any) { return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders }); }
        }

        if (request.method === 'POST' && url.pathname === '/api/share-verse') {
            try {
                const body: any = await request.json();
                const userId = body.userId;
                if (!userId) {
                    return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: corsHeaders });
                }

                const book = body.book || '';
                const chapter = body.chapter || 1;
                const verses = body.verses || '';
                const version = body.version || 'AYT';
                const note = body.note || '';
                const items: Array<{ verse: number; text: string }> = Array.isArray(body.items) ? body.items : [];
                const webAppUrl = 'https://bibleonbot-testing-webapp.pages.dev/';

                const tableCells: any[][] = [];

                if (items.length > 0) {
                    items.forEach(item => {
                        tableCells.push([
                            {
                                text: { type: 'bold', text: String(item.verse) },
                                align: 'center',
                                valign: 'top'
                            },
                            {
                                text: item.text,
                                align: 'left',
                                valign: 'top'
                            }
                        ]);
                    });
                } else if (body.content) {
                    tableCells.push([
                        {
                            text: { type: 'bold', text: String(verses) },
                            align: 'center',
                            valign: 'top'
                        },
                        {
                            text: body.content,
                            align: 'left',
                            valign: 'top'
                        }
                    ]);
                }

                const blocks: any[] = [
                    {
                        type: 'paragraph',
                        text: { type: 'bold', text: `${book} ${chapter}:${verses} (${version})` }
                    },
                    {
                        type: 'table',
                        is_compact: true,
                        cells: tableCells
                    }
                ];

                if (note) {
                    blocks.push({
                        type: 'details',
                        summary: 'Catatan Pribadi',
                        is_open: true,
                        blocks: [
                            {
                                type: 'paragraph',
                                text: { type: 'italic', text: note }
                            }
                        ]
                    });
                }

                const directAppUrl = 'https://t.me/bibleon_dev_bot?startapp=open';

                blocks.push({
                    type: 'buttons',
                    align: 'center',
                    buttons: [
                        {
                            text: 'Buka Alkitab',
                            style: 'primary',
                            url: directAppUrl
                        }
                    ]
                });

                const bot = new TelegramBot(this.env.TELEGRAM_BOT_TOKEN);
                const sent = await bot.sendRichMessage(userId, { blocks });

                if (!sent) {
                    let fallbackContent = '';
                    if (items.length > 0) {
                        fallbackContent = items.map(item => `<b>${item.verse}</b> ${item.text}`).join('\n\n');
                    } else {
                        fallbackContent = body.content || '';
                    }

                    const fallbackText = `<b>${book} ${chapter}:${verses} (${version})</b>\n\n${fallbackContent}${note ? `\n\n<i>${note}</i>` : ''}`;
                    const replyMarkup = {
                        inline_keyboard: [[
                            { text: 'Buka Alkitab', url: directAppUrl }
                        ]]
                    };
                    await bot.sendMessage(userId, fallbackText, replyMarkup);
                }

                return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            } catch (error: any) {
                console.error('Share Verse Error:', error);
                return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
            }
        }

        if (request.method === 'POST' && url.pathname === '/api/admin/daily-verse') {
            try {
                const body: any = await request.json();
                await this.env.DB.prepare("UPDATE daily_verse SET reference = ?, text = ? WHERE id = 1").bind(body.reference, body.text).run();
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            } catch (error: any) { return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders }); }
        }

        // ==========================================
        // ROUTE BERITA (POST, PUT, DELETE)
        // ==========================================
        if (url.pathname === '/api/admin/news') {
            try {
                if (request.method === 'POST') {
                    const body: any = await request.json();
                    await this.env.DB.prepare("INSERT INTO news (title, category, image_url, link) VALUES (?, ?, ?, ?)").bind(body.title, body.category, body.image_url, body.link).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
                if (request.method === 'PUT') {
                    const body: any = await request.json();
                    await this.env.DB.prepare("UPDATE news SET title=?, category=?, image_url=?, link=? WHERE id=?").bind(body.title, body.category, body.image_url, body.link, body.id).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
                if (request.method === 'DELETE') {
                    const id = url.searchParams.get('id');
                    await this.env.DB.prepare("DELETE FROM news WHERE id=?").bind(id).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
            } catch (error: any) { return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders }); }
        }

        // ==========================================
        // ROUTE KOMUNITAS/CHANNEL (POST, PUT, DELETE)
        // ==========================================
        if (url.pathname === '/api/admin/community') {
            try {
                if (request.method === 'POST') {
                    const body: any = await request.json();
                    await this.env.DB.prepare("INSERT INTO communities (name, member_count, category, link, is_channel) VALUES (?, ?, ?, ?, ?)").bind(body.name, body.member_count, body.category, body.link, body.is_channel).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
                if (request.method === 'PUT') {
                    const body: any = await request.json();
                    await this.env.DB.prepare("UPDATE communities SET name=?, member_count=?, category=?, link=?, is_channel=? WHERE id=?").bind(body.name, body.member_count, body.category, body.link, body.is_channel, body.id).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
                if (request.method === 'DELETE') {
                    const id = url.searchParams.get('id');
                    await this.env.DB.prepare("DELETE FROM communities WHERE id=?").bind(id).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
            } catch (error: any) { return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders }); }
        }

        // ==========================================
        // ROUTE AYAT TERSIMPAN (GET, POST, DELETE)
        // ==========================================
        if (url.pathname === '/api/saved-verses') {
            try {
                if (request.method === 'GET') {
                    const userId = url.searchParams.get('userId');
                    const saved = await this.env.DB.prepare("SELECT * FROM saved_verses WHERE user_id = ? ORDER BY created_at DESC, id DESC").bind(userId).all();
                    return new Response(JSON.stringify(saved.results || []), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
                }
                if (request.method === 'POST') {
                    const body: any = await request.json();
                    const version = body.version || 'AYT';
                    const labels = typeof body.labels === 'string' ? body.labels : (Array.isArray(body.labels) ? body.labels.join(', ') : (body.labels || ''));
                    const isCompletelyEmpty = (!body.color || body.color.trim() === '') && (!body.note || body.note.trim() === '') && (!labels || labels.trim() === '');

                    const existing = await this.env.DB.prepare("SELECT id FROM saved_verses WHERE user_id = ? AND book = ? AND chapter = ? AND verse = ?")
                        .bind(body.user_id, body.book, body.chapter, body.verse).first();

                    if (isCompletelyEmpty) {
                        if (existing) {
                            await this.env.DB.prepare("DELETE FROM saved_verses WHERE id = ?").bind(existing.id).run();
                        }
                        return new Response(JSON.stringify({ success: true, deleted: true }), { headers: corsHeaders });
                    }

                    if (existing) {
                        await this.env.DB.prepare("UPDATE saved_verses SET color = ?, content = ?, note = ?, version = ?, labels = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?")
                            .bind(body.color, body.content, body.note, version, labels, existing.id).run();
                    } else {
                        await this.env.DB.prepare("INSERT INTO saved_verses (user_id, book, chapter, verse, content, color, note, version, labels, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
                            .bind(body.user_id, body.book, body.chapter, body.verse, body.content, body.color, body.note, version, labels).run();
                    }
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
                if (request.method === 'DELETE') {
                    const id = url.searchParams.get('id');
                    await this.env.DB.prepare("DELETE FROM saved_verses WHERE id = ?").bind(id).run();
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                }
            } catch (error: any) { 
                console.error('Saved Verses API Error:', error);
                return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders }); 
            }
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
}