import { randomUUID } from 'crypto'
import type { FastifyTypedInstance } from '../types'
import z from 'zod'

interface Company {
    id: string,
    name: string,
    cnpj: string,
    users: User[],
    userGroups: UserGroup[],
}

interface User {
    id: string,
    name: string,
    email: string,
    companyId?: string,
    userType: string,
}

interface UserGroup {
    id: string,
    name: string,
    users: User[],
}

const companies: Company[] = []

export async function companyRoutes(app: FastifyTypedInstance) {
    app.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = routeOptions.schema || {}
        routeOptions.schema.tags = ['Companies']
    })

    app.get('/companies', {
        schema: {
            description: 'Get all companies',
            tags: ['Companies'],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    cnpj: z.string(),
                    users: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        userType: z.string(),
                    })),
                    userGroups: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        users: z.array(z.object({
                            id: z.string(),
                            name: z.string(),
                            email: z.string(),
                            userType: z.string(),
                        })),
                    })),
                })).describe('List of companies'),
            },
        }
    }, () => {
        return companies
    })

    app.post('/companies', {
        schema: {
            description: 'Create a new company',
            tags: ['Companies'],
            body: z.object({
                name: z.string(),
                cnpj: z.string(),
            }),
            response: {
                201: z.null().describe('Company created successfully'),
            },
        }
    }, async (request, reply) => {
        const { name, cnpj } = request.body

        companies.push({
            id: randomUUID(),
            name,
            cnpj,
            users: [],
            userGroups: [],
        })

        return reply.status(201).send()
    })

    app.get('/companies/:id', {
        schema: {
            description: 'Get a company by ID',
            tags: ['Companies'],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                    cnpj: z.string(),
                    users: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        userType: z.string(),
                    })),
                    userGroups: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        users: z.array(z.object({
                            id: z.string(),
                            name: z.string(),
                            email: z.string(),
                            userType: z.string(),
                        })),
                    })),
                }).describe('Company details'),
                404: z.null().describe('Company not found'),
            },
        }
    }, async (request, reply) => {
        const company = companies.find(c => c.id === request.params.id)
        if (company) {
            return company
        } else {
            return reply.status(404).send()
        }
    })

    app.put('/companies/:id', {
        schema: {
            description: 'Update a company by ID',
            tags: ['Companies'],
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                name: z.string().optional(),
                cnpj: z.string().optional(),
            }),
            response: {
                200: z.null().describe('Company updated successfully'),
                404: z.null().describe('Company not found'),
            },
        }
    }, async (request, reply) => {
        const company = companies.find(c => c.id === request.params.id)
        if (company) {
            if (request.body.name) company.name = request.body.name
            if (request.body.cnpj) company.cnpj = request.body.cnpj
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })

    app.delete('/companies/:id', {
        schema: {
            description: 'Delete a company by ID',
            tags: ['Companies'],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.null().describe('Company deleted successfully'),
                404: z.null().describe('Company not found'),
            },
        }
    }, async (request, reply) => {
        const companyIndex = companies.findIndex(c => c.id === request.params.id)
        if (companyIndex !== -1) {
            companies.splice(companyIndex, 1)
            return reply.status(200).send()
        } else {
            return reply.status(404).send()
        }
    })
}
