import { TelegramBot, TelegramUpdate, TelegramMessage } from './telegram';
import enLocale from '../locales/en.json';
import idLocale from '../locales/id.json';

export interface Env {
    DB: D1Database;
    TELEGRAM_BOT_TOKEN: string;
    ADMIN_TELEGRAM_ID: string;
}

const locales: Record<string, any> = {
    en: enLocale,
    id: idLocale
};

export class BotHandler {
    private bot: TelegramBot;
    private env: Env;

    constructor(bot: TelegramBot, env: Env) {
        this.bot = bot;
        this.env = env;
    }

    async handleUpdate(update: TelegramUpdate): Promise<void> {
        if (update.message) {
            await this.handleMessage(update.message);
        }
    }

    private async getLocale(userId: number): Promise<any> {
        try {
            const stmt = this.env.DB.prepare('SELECT language FROM users WHERE telegram_id = ?').bind(userId);
            const result = await stmt.first<{ language: string }>();
            const lang = result?.language || 'id';
            return locales[lang] || locales['id'];
        } catch (error) {
            console.error('Database Query Error in getLocale:', error);
            return locales['id'];
        }
    }

    private async handleMessage(message: TelegramMessage): Promise<void> {
        const chatId = message.chat.id;
        const text = message.text || '';
        const userId = message.from?.id;

        if (!userId) return;

        try {
            await this.env.DB.prepare(
                'INSERT INTO users (telegram_id, language) VALUES (?, ?) ON CONFLICT(telegram_id) DO NOTHING'
            ).bind(userId, 'id').run();
        } catch (error) {
            console.error('Database Insert Error in handleMessage (User):', error);
        }

        const t = await this.getLocale(userId);
        const isAdmin = userId.toString() === this.env.ADMIN_TELEGRAM_ID;

        if (text.startsWith('/start')) {
            const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const userName = message.from?.first_name || 'Saudara';
            const directAppUrl = 'https://t.me/bibleon_dev_bot?startapp=open';
            const donationUrl = 'https://saweria.co/tobiasilya';

            const blocks: any[] = [
                {
                    type: 'slideshow',
                    blocks: [
                        { type: 'photo', photo: { type: 'photo', media: 'https://i.ibb.co/1tBXx9Dw/Group-1.png' } },
                        { type: 'photo', photo: { type: 'photo', media: 'https://i.ibb.co/pTs3NjC/Group-2.png' } },
                        { type: 'photo', photo: { type: 'photo', media: 'https://i.ibb.co/q37ZkPdC/Group-4.png' } },
                        { type: 'photo', photo: { type: 'photo', media: 'https://i.ibb.co/k2cgvDVL/Group-3.png' } }
                    ]
                },
                {
                    type: 'heading',
                    size: 1,
                    text: `Selamat datang saudara ${userName}`
                },
                {
                    type: 'details',
                    summary: 'Tentang Alkitab ID',
                    blocks: [
                        {
                            type: 'paragraph',
                            text: 'Alkitab ID adalah Alkitab yang dapat diakses langsung melalui Telegram Mini App secara gratis. Nikmati berbagai fitur menarik serta pilihan terjemahan Alkitab untuk membantu Anda membaca dan memahami Firman Tuhan dengan lebih mudah.'
                        }
                    ]
                },
                {
                    type: 'details',
                    summary: 'Ingin Berdonasi?',
                    blocks: [
                        {
                            type: 'paragraph',
                            text: 'Silakan donasi via Saweria:'
                        },
                        {
                            type: 'buttons',
                            align: 'center',
                            buttons: [
                                {
                                    text: 'Donasi via Saweria',
                                    style: 'success',
                                    url: donationUrl
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'paragraph',
                    text: 'Silakan tekan tombol di bawah ini untuk membuka Alkitab:'
                },
                {
                    type: 'buttons',
                    align: 'center',
                    buttons: [
                        {
                            text: 'Buka Alkitab',
                            style: 'primary',
                            url: directAppUrl
                        }
                    ]
                }
            ];

            const sent = await this.bot.sendRichMessage(chatId, { blocks });
            if (!sent) {
                const fallbackText = `<b>Selamat datang saudara ${escapeHtml(userName)}</b>\n\nAlkitab ID adalah Alkitab yang dapat diakses langsung melalui Telegram Mini App secara gratis. Nikmati berbagai fitur menarik serta pilihan terjemahan Alkitab untuk membantu Anda membaca dan memahami Firman Tuhan dengan lebih mudah.\n\nSilakan tekan tombol di bawah ini untuk membuka Alkitab:`;
                const replyMarkup = {
                    inline_keyboard: [
                        [{ text: 'Buka Alkitab', url: directAppUrl }],
                        [{ text: 'Donasi via Saweria', url: donationUrl }]
                    ]
                };
                await this.bot.sendMessage(chatId, fallbackText, replyMarkup);
            }
            return;
        }

        if (text.startsWith('/lang')) {
            const newLang = text.split(' ')[1];
            if (newLang === 'en' || newLang === 'id') {
                try {
                    await this.env.DB.prepare('UPDATE users SET language = ? WHERE telegram_id = ?').bind(newLang, userId).run();
                    const newT = locales[newLang];
                    await this.bot.sendMessage(chatId, newT.language_changed);
                } catch (error) {
                    console.error('Database Update Error in handleMessage (Language):', error);
                    await this.bot.sendMessage(chatId, t.error_general);
                }
            } else {
                await this.bot.sendMessage(chatId, 'Usage: /lang en | /lang id');
            }
            return;
        }

        if (text.startsWith('/admin')) {
            if (!isAdmin) {
                await this.bot.sendMessage(chatId, t.unauthorized);
                return;
            }

            const replyMarkup = {
                keyboard: [
                    [{ text: t.admin_btn_daily_verse }],
                    [{ text: t.admin_btn_community }, { text: t.admin_btn_channels }],
                    [{ text: t.admin_btn_news }, { text: t.admin_btn_close }]
                ],
                resize_keyboard: true,
                one_time_keyboard: false
            };
            await this.bot.sendMessage(chatId, t.admin_welcome, replyMarkup);
            return;
        }

        if (isAdmin) {
            if (text === t.admin_btn_close) {
                const replyMarkup = { remove_keyboard: true };
                await this.bot.sendMessage(chatId, t.admin_closed, replyMarkup);
                return;
            }

            if (text === t.admin_btn_daily_verse) {
                await this.bot.sendMessage(chatId, t.admin_prompt_verse);
                return;
            }

            if (text.includes('|') && text.split('|').length === 2) {
                const [verseText, verseRef] = text.split('|').map(s => s.trim());
                try {
                    await this.env.DB.prepare(
                        'INSERT INTO daily_verse (verse_text, verse_reference) VALUES (?, ?)'
                    ).bind(verseText, verseRef).run();
                    await this.bot.sendMessage(chatId, t.admin_success);
                } catch (error) {
                    console.error('Database Insert Error in handleMessage (Daily Verse):', error);
                    await this.bot.sendMessage(chatId, t.error_general);
                }
                return;
            }
        }
    }
}