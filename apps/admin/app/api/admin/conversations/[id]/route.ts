/**
 * PATCH /api/admin/conversations/[id]  — close or reopen a chat conversation.
 * Store-scoped to the conversation's store.
 */
import { z } from 'zod'
import { defineMutation, notFound } from '../../../../../lib/mutation'

const StatusSchema = z.object({
  status: z.enum(['active', 'closed']),
})

export const PATCH = defineMutation({
  schema:     StatusSchema,
  action:     'CONVERSATION_CLOSED',
  entityType: 'ChatConversation',
  run: async ({ data, params, tx, assertScope }) => {
    const convo = await tx.chatConversation.findUnique({
      where:  { id: params.id },
      select: { id: true, storeId: true, status: true },
    })
    if (!convo) throw notFound('Conversation not found')

    assertScope(convo.storeId)

    const updated = await tx.chatConversation.update({
      where: { id: convo.id },
      data:  { status: data.status, resolvedAt: data.status === 'closed' ? new Date() : null },
      select: { id: true, status: true },
    })

    return {
      result:   updated,
      entityId: updated.id,
      before:   { status: convo.status },
      after:    { status: updated.status },
    }
  },
})
