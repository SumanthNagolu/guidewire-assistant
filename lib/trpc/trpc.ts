import { initTRPC, TRPCError } from '@trpc/server'
import { type Context } from './context'
import superjson from 'superjson'
import { ZodError } from 'zod'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  })
})

const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  
  const { data: profile } = await ctx.supabase
    .from('user_profiles')
    .select('role')
    .eq('id', ctx.user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)


