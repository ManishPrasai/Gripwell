/**
 * PATCH /api/admin/reviews/[id]  — post (or update) a public reply to a review.
 *
 * Store-scoped: a manager may only reply to their own store's reviews.
 */
import { z } from 'zod'
import { defineMutation, notFound } from '../../../../../lib/mutation'

const ReplySchema = z.object({
  reply: z.string().trim().min(1, 'Reply cannot be empty').max(2000),
})

export const PATCH = defineMutation({
  schema:     ReplySchema,
  action:     'REVIEW_REPLIED',
  entityType: 'Review',
  run: async ({ data, admin, params, tx, assertScope }) => {
    const existing = await tx.review.findUnique({
      where:  { id: params.id },
      select: { id: true, storeId: true, reply: true },
    })
    if (!existing) throw notFound('Review not found')

    assertScope(existing.storeId)

    const updated = await tx.review.update({
      where: { id: existing.id },
      data:  { reply: data.reply, repliedAt: new Date(), repliedById: admin.id },
      select: { id: true, reply: true, repliedAt: true },
    })

    return {
      result:   updated,
      entityId: updated.id,
      before:   { reply: existing.reply },
      after:    { reply: updated.reply },
    }
  },
})
