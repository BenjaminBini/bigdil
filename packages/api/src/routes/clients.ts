import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const clientsRouter = new Hono()

// PATCH /api/clients/:id — update a client
clientsRouter.patch('/:id', async (c) => {
  const clientId = c.req.param('id')
  const body = await c.req.json<{ name?: string; contactName?: string; contactEmail?: string; address?: string }>()

  const existing = await prisma.client.findUnique({ where: { id: clientId } })
  if (!existing) return c.json({ error: 'Client not found' }, 404)

  const client = await prisma.client.update({
    where: { id: clientId },
    data: {
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
      ...(body.contactName?.trim() ? { contactName: body.contactName.trim() } : {}),
      ...(body.contactEmail?.trim() ? { contactEmail: body.contactEmail.trim() } : {}),
      ...(body.address !== undefined ? { address: body.address.trim() } : {}),
    },
  })

  return c.json(client)
})

// POST /api/clients — create a new client
clientsRouter.post('/', async (c) => {
  const body = await c.req.json<{ name: string; contactName: string; contactEmail: string; address: string }>()

  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400)
  if (!body.contactName?.trim()) return c.json({ error: 'contactName is required' }, 400)
  if (!body.contactEmail?.trim()) return c.json({ error: 'contactEmail is required' }, 400)

  const client = await prisma.client.create({
    data: {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      contactName: body.contactName.trim(),
      contactEmail: body.contactEmail.trim(),
      address: body.address?.trim() ?? '',
    },
  })

  return c.json(client, 201)
})
