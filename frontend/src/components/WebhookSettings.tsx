import type { FrasSettings } from '../lib/types';

interface Props {
  settings: FrasSettings;
  onChange: (s: FrasSettings) => void;
}

export default function WebhookSettings({ settings, onChange }: Props) {
  const update = (partial: Partial<FrasSettings>) => onChange({ ...settings, ...partial });

  return (
    <details className="bg-gray-900 rounded-xl border border-gray-800">
      <summary className="px-5 py-3 cursor-pointer text-sm text-gray-400 hover:text-gray-200 font-medium select-none">
        Alert Settings (Telegram / Discord)
      </summary>
      <div className="px-5 pb-5 space-y-3 border-t border-gray-800 pt-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">Telegram Bot Token</label>
          <input
            type="password"
            value={settings.telegram_token}
            onChange={(e) => update({ telegram_token: e.target.value })}
            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">Telegram Chat ID</label>
          <input
            type="text"
            value={settings.telegram_chat_id}
            onChange={(e) => update({ telegram_chat_id: e.target.value })}
            placeholder="-1001234567890"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">Discord Webhook URL</label>
          <input
            type="url"
            value={settings.discord_webhook_url}
            onChange={(e) => update({ discord_webhook_url: e.target.value })}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </details>
  );
}
