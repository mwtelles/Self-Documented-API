import { randomUUID } from 'crypto'
import type { FastifyTypedInstance } from '../types'
import z from 'zod'

interface UserType {
    id: string,
    type: string,
    permissions: string[],
}

const userTypes: UserType[] = []

export async function userTypeRoutes(app: FastifyTypedInstance) {
    app.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = routeOptions.schema || {}
        routeOptions.schema.tags = ['User Types']
    })

    app.get('/userTypes', {
        schema: {
            description: 'Get all user types',
            tags: ['User Types'],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    type: z.string(),
                    permissions: z.array(z.string()),
                })).describe('List of user types'),
            },
        }
    }, () => {
        return userTypes
    })

    app.post('/userTypes', {
        schema: {
            description: 'Create a new user type',
            tags: ['User Types'],
            body: z.object({
                type: z.string(),
                permissions: z.array(z.string()).optional(),
            }),
            response: {
                201: z.null().describe('User type created successfully'),
            },
        }
    }, async (request, reply) => {
        const { type, permissions = [] } = request.body

        userTypes.push({
            id: randomUUID(),
            type,
            permissions,
        })

        return reply.status(201).send()
    })

    app.get('/userTypes/:id', {
        schema: {
            description: 'Get a user type by ID',
            tags: ['User Types'],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    type: z.string(),
                    permissions: z.array(z.string()),
                }).describe('User type details'),
                404: z.null().describe('User type not found'),
            },
        }
    }, async (request, reply) => {
        const userType = userTypes.find(ut => ut.id === request.params.id)
        if (userType) {
            return userType
        } else {
            return reply.status(404).send()
        }
    })

    app.put('/userTypes/:id', {
        schema: {
            description: 'Update a user type by ID',
            tags: ['User Types'],
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                type: z.string().optional(),
                permissions: z.array(z.string()).optional(),
            }),
            response: {
                200: z.null().describe('User type updated successfully'),
                404: z.null().describe('User type not found'),
            },
        }
    }, async (request, reply) => {
        const userType = userTypes.find(ut => ut.id === request.params.id)
        if (userType) {
            if (request.body.type) userType.type = request.body.type
            if (request.body.permissions) userType.permissions = request.body.permissions
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })

    app.delete('/userTypes/:id', {
        schema: {
            description: 'Delete a user type by ID',
            tags: ['User Types'],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.null().describe('User type deleted successfully'),
                404: z.null().describe('User type not found'),
            },
        }
    }, async (request, reply) => {
        const userTypeIndex = userTypes.findIndex(ut => ut.id === request.params.id)
        if (userTypeIndex !== -1) {
            userTypes.splice(userTypeIndex, 1)
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })

    // New route to assign permissions to a user type
    app.put('/userTypes/:id/permissions', {
        schema: {
            description: 'Assign permissions to a user type',
            tags: ['User Types'],
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                permissions: z.array(z.string()),
            }),
            response: {
                200: z.null().describe('Permissions assigned successfully'),
                404: z.null().describe('User type not found'),
            },
        }
    }, async (request, reply) => {
        const userType = userTypes.find(ut => ut.id === request.params.id)
        if (userType) {
            userType.permissions = request.body.permissions
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })
}
