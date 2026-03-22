import { AccessToken } from 'livekit-server-sdk'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const roomName = query.room as string
  const identity = query.identity as string

  if (!roomName || !identity) {
    throw createError({ statusCode: 400, statusMessage: 'Missing room or identity' })
  }

  // Беремо ключі з env
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  const at = new AccessToken(apiKey, apiSecret, {
    identity: identity,
    ttl: '24h', // Токен буде дійсний 24 години
  });

  // Даємо права на вхід та публікацію звуку
  at.addGrant({ 
    roomJoin: true, 
    room: roomName, 
    canPublish: true, 
    canSubscribe: true 
  })

  return {
    token: await at.toJwt()
  }
})