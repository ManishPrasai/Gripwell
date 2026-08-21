/**
 * POST /api/admin/messages  — send a reply in a customer chat conversation.
 *
 * Store-scoped: a manager may only reply in their own store's conversations.
 * Sending also marks the conversation active and stamps first-response time.
 */
import { z } from 'zod'
import { defineMutation, notFound } from '../../../../lib/mutation'

const SendSchema = z.object({
  conversationId: z.string().min(1),
  body:           z.string().trim().min(1, 'Message cannot be empty').max(4000),
})

export const POST = defineMutation({
  schema:     SendSchema,
  action:     'MESSAGE_SENT',
  entityType: 'ChatMessage',
  run: async ({ data, admin, tx, assertScope }) => {
    const convo = await tx.chatConversation.findUnique({
      where:  { id: data.conversationId },
      select: { id: true, storeId: true, firstResponseAt: true },
    })
    if (!convo) throw notFound('Conversation not found')

    assertScope(convo.storeId)

    const message = await tx.chatMessage.create({
      data: {
        conversationId: convo.id,
        senderType:     'admin',
        senderId:       admin.id,
        body:           data.body,
        isRead:         true,
      },
      select: { id: true, body: true, createdAt: true },
    })

    await tx.chatConversation.update({
      where: { id: convo.id },
      data: {
        status:          'active',
        assignedTo:      admin.id,
        firstResponseAt: convo.firstResponseAt ?? new Date(),
      },
    })

    return {
      result:   message,
      entityId: message.id,
      after:    { conversationId: convo.id, body: data.body },
    }
  },
})
