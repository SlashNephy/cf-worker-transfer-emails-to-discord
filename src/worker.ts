import type { ForwardableEmailMessage } from '@cloudflare/workers-types'

export type Env = {
  FORWARD_TO?: string
  DISCORD_WEBHOOK_URL: string
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    if (env.FORWARD_TO) {
      await message.forward(env.FORWARD_TO)
    }

    await executeDiscordWebhook(env.DISCORD_WEBHOOK_URL, message)
  },
}

async function executeDiscordWebhook(
  url: string,
  message: ForwardableEmailMessage,
): Promise<void> {
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username:
        message.headers.get('From')?.replace(/^"(.+)" <(.+)>$/, '$1 <$2>')
        ?? message.from,
      embeds: [
        {
          title: message.headers.get('Subject'),
          footer: {
            text: message.to,
          },
        },
      ],
    }),
  })
}
