import { randomUUID } from 'crypto'
import type { FastifyTypedInstance } from '../types'
import z from 'zod'

interface Permission {
    id: string,
    name: string,
    description: string,
}

const permissions: Permission[] = [
    { id: randomUUID(), name: 'read', description: 'Read permission' },
    { id: randomUUID(), name: 'write', description: 'Write permission' },
    { id: randomUUID(), name: 'delete', description: 'Delete permission' },
]

export async function permissionRoutes(app: FastifyTypedInstance) {
    app.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = routeOptions.schema || {}
        routeOptions.schema.tags = ['Permissions']
    })

    app.get('/permissions', {
        schema: {
            description: 'Get all permissions',
            tags: ['Permissions'],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string(),
                })).describe('List of permissions'),
            },
        }
    }, () => {
        return permissions
    })

    app.post('/permissions', {
        schema: {
            description: 'Create a new permission',
            tags: ['Permissions'],
            body: z.object({
                name: z.string(),
                description: z.string(),
            }),
            response: {
                201: z.null().describe('Permission created successfully'),
            },
        }
    }, async (request, reply) => {
        const { name, description } = request.body

        permissions.push({
            id: randomUUID(),
            name,
            description,
        })

        return reply.status(201).send()
    })

    app.get('/permissions/:id', {
        schema: {
            description: 'Get a permission by ID',
            tags: ['Permissions'],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string(),
                }).describe('Permission details'),
                404: z.null().describe('Permission not found'),
            },
        }
    }, async (request, reply) => {
        const permission = permissions.find(p => p.id === request.params.id)
        if (permission) {
            return permission
        } else {
            return reply.status(404).send()
        }
    })

    app.put('/permissions/:id', {
        schema: {
            description: 'Update a permission by ID',
            tags: ['Permissions'],
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                name: z.string().optional(),
                description: z.string().optional(),
            }),
            response: {
                200: z.null().describe('Permission updated successfully'),
                404: z.null().describe('Permission not found'),
            },
        }
    }, async (request, reply) => {
        const permission = permissions.find(p => p.id === request.params.id)
        if (permission) {
            if (request.body.name) permission.name = request.body.name
            if (request.body.description) permission.description = request.body.description
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })

    app.delete('/permissions/:id', {
        schema: {
            description: 'Delete a permission by ID',
            tags: ['Permissions'],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.null().describe('Permission deleted successfully'),
                404: z.null().describe('Permission not found'),
            },
        }
    }, async (request, reply) => {
        const permissionIndex = permissions.findIndex(p => p.id === request.params.id)
        if (permissionIndex !== -1) {
            permissions.splice(permissionIndex, 1)
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })
}
