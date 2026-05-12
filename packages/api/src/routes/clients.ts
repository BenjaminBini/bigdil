import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { auditLog } from '../lib/audit.js'

export const clientsRouter = new Hono()

interface ClientWriteBody {
  name?: string
  contactName?: string
  contactEmail?: string
  addressLine1?: string
  addressLine2?: string | null
  postalCode?: string
  city?: string
  country?: string
}

function trimOrUndefined(value: string | undefined) {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

// PATCH /api/clients/:id — update a client
clientsRouter.patch('/:id', async (c) => {
  const clientId = c.req.param('id')
  const body = await c.req.json<ClientWriteBody>()

  const existing = await prisma.client.findUnique({ where: { id: clientId } })
  if (!existing) return c.json({ error: 'Client not found' }, 404)

  const data = {
    ...(trimOrUndefined(body.name) ? { name: trimOrUndefined(body.name)! } : {}),
    ...(trimOrUndefined(body.contactName) ? { contactName: trimOrUndefined(body.contactName)! } : {}),
    ...(trimOrUndefined(body.contactEmail) ? { contactEmail: trimOrUndefined(body.contactEmail)! } : {}),
    ...(trimOrUndefined(body.addressLine1) ? { addressLine1: trimOrUndefined(body.addressLine1)! } : {}),
    ...(body.addressLine2 !== undefined ? { addressLine2: body.addressLine2?.trim() || null } : {}),
    ...(trimOrUndefined(body.postalCode) ? { postalCode: trimOrUndefined(body.postalCode)! } : {}),
    ...(trimOrUndefined(body.city) ? { city: trimOrUndefined(body.city)! } : {}),
    ...(trimOrUndefined(body.country) ? { country: trimOrUndefined(body.country)!.toUpperCase().slice(0, 2) } : {}),
  }

  const client = await prisma.client.update({ where: { id: clientId }, data })
  await auditLog({ entity: 'Client', entityId: client.id, action: 'UPDATE', before: existing, after: client })

  return c.json(client)
})

// POST /api/clients — create a new client
clientsRouter.post('/', async (c) => {
  const body = await c.req.json<ClientWriteBody>()

  const name = trimOrUndefined(body.name)
  const contactName = trimOrUndefined(body.contactName)
  const contactEmail = trimOrUndefined(body.contactEmail)
  const addressLine1 = trimOrUndefined(body.addressLine1)
  const postalCode = trimOrUndefined(body.postalCode)
  const city = trimOrUndefined(body.city)
  const country = trimOrUndefined(body.country)?.toUpperCase().slice(0, 2)

  if (!name) return c.json({ error: 'name is required' }, 400)
  if (!contactName) return c.json({ error: 'contactName is required' }, 400)
  if (!contactEmail) return c.json({ error: 'contactEmail is required' }, 400)
  if (!addressLine1) return c.json({ error: 'addressLine1 is required' }, 400)
  if (!postalCode) return c.json({ error: 'postalCode is required' }, 400)
  if (!city) return c.json({ error: 'city is required' }, 400)
  if (!country) return c.json({ error: 'country is required (ISO-3166 alpha-2)' }, 400)

  const client = await prisma.client.create({
    data: {
      name,
      contactName,
      contactEmail,
      addressLine1,
      addressLine2: body.addressLine2?.trim() || null,
      postalCode,
      city,
      country,
    },
  })
  await auditLog({ entity: 'Client', entityId: client.id, action: 'CREATE', after: client })

  return c.json(client, 201)
})
