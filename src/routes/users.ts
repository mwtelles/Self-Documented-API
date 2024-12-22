import { randomUUID } from 'crypto'
import type { FastifyTypedInstance } from '../types'
import z from 'zod'

interface User {
    id: string,
    name: string,
    email: string,
    companyId?: string,
    userType: string,
    permissions: string[],
}

const users: User[] = []

export async function userRoutes(app: FastifyTypedInstance) {
    app.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = routeOptions.schema || {}
        routeOptions.schema.tags = ['Users']
    })

    app.get('/users', {
        schema: {
            description: 'Get all users',
            tags: ['Users'],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    companyId: z.string().optional(),
                    userType: z.string(),
                    permissions: z.array(z.string()),
                })).describe('List of users'),
            },
        }
    }, () => {
        return users
    })

    app.post('/users', {
        schema: {
            description: 'Create a new user',
            tags: ['Users'],
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                companyId: z.string().optional(),
                userType: z.string(),
                permissions: z.array(z.string()).optional(),
            }),
            response: {
                201: z.null().describe('User created successfully'),
            },
        }
    }, async (request, reply) => {
        const { name, email, companyId, userType, permissions = [] } = request.body

        users.push({
            id: randomUUID(),
            name,
            email,
            companyId,
            userType,
            permissions,
        })

        return reply.status(201).send()
    })

    app.get('/users/:id', {
        schema: {
            description: 'Get a user by ID',
            tags: ['Users'],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    companyId: z.string().optional(),
                    userType: z.string(),
                    permissions: z.array(z.string()),
                }).describe('User details'),
                404: z.null().describe('User not found'),
            },
        }
    }, async (request, reply) => {
        const user = users.find(u => u.id === request.params.id)
        if (user) {
            return user
        } else {
            return reply.status(404).send()
        }
    })

    app.put('/users/:id', {
        schema: {
            description: 'Update a user by ID',
            tags: ['Users'],
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                name: z.string().optional(),
                email: z.string().email().optional(),
                companyId: z.string().optional(),
                userType: z.string().optional(),
                permissions: z.array(z.string()).optional(),
            }),
            response: {
                200: z.null().describe('User updated successfully'),
                404: z.null().describe('User not found'),
            },
        }
    }, async (request, reply) => {
        const user = users.find(u => u.id === request.params.id)
        if (user) {
            if (request.body.name) user.name = request.body.name
            if (request.body.email) user.email = request.body.email
            if (request.body.companyId !== undefined) user.companyId = request.body.companyId
            if (request.body.userType) user.userType = request.body.userType
            if (request.body.permissions) user.permissions = request.body.permissions
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })

    app.delete('/users/:id', {
        schema: {
            description: 'Delete a user by ID',
            tags: ['Users'],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.null().describe('User deleted successfully'),
                404: z.null().describe('User not found'),
            },
        }
    }, async (request, reply) => {
        const userIndex = users.findIndex(u => u.id === request.params.id)
        if (userIndex !== -1) {
            users.splice(userIndex, 1)
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })

    app.get('/users/type/:userType', {
        schema: {
            description: 'Get users by type',
            tags: ['Users'],
            params: z.object({
                userType: z.string(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    companyId: z.string().optional(),
                    userType: z.string(),
                    permissions: z.array(z.string()),
                })).describe('List of users by type'),
            },
        }
    }, async (request, reply) => {
        const { userType } = request.params
        const filteredUsers = users.filter(u => u.userType === userType)
        return filteredUsers
    })

    app.get('/users/company/:companyId', {
        schema: {
            description: 'Get users by company',
            tags: ['Users'],
            params: z.object({
                companyId: z.string(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    companyId: z.string().optional(),
                    userType: z.string(),
                    permissions: z.array(z.string()),
                })).describe('List of users by company'),
            },
        }
    }, async (request, reply) => {
        const { companyId } = request.params
        const filteredUsers = users.filter(u => u.companyId === companyId)
        return filteredUsers
    })

    app.get('/users/company/:companyId/type/:userType', {
        schema: {
            description: 'Get users by type within a company',
            tags: ['Users'],
            params: z.object({
                companyId: z.string(),
                userType: z.string(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    companyId: z.string().optional(),
                    userType: z.string(),
                    permissions: z.array(z.string()),
                })).describe('List of users by type within a company'),
            },
        }
    }, async (request, reply) => {
        const { companyId, userType } = request.params
        const filteredUsers = users.filter(u => u.companyId === companyId && u.userType === userType)
        return filteredUsers
    })

    // New route to assign permissions to a user
    app.put('/users/:id/permissions', {
        schema: {
            description: 'Assign permissions to a user',
            tags: ['Users'],
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                permissions: z.array(z.string()),
            }),
            response: {
                200: z.null().describe('Permissions assigned successfully'),
                404: z.null().describe('User not found'),
            },
        }
    }, async (request, reply) => {
        const user = users.find(u => u.id === request.params.id)
        if (user) {
            user.permissions = request.body.permissions
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })
}
