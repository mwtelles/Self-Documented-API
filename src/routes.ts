import type { FastifyTypedInstance } from './types'
import { userRoutes } from './routes/users'
import { userTypeRoutes } from './routes/userTypes'
import { companyRoutes } from './routes/companies'
import { permissionRoutes } from './routes/permissions'

export async function routes(app: FastifyTypedInstance) {
    await userRoutes(app)
    await userTypeRoutes(app)
    await companyRoutes(app)
    await permissionRoutes(app)
}