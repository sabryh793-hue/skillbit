// auth.interface.ts
import { Request } from 'express'

export interface AuthReq extends Request {
  user: any
}