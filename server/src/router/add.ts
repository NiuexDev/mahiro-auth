import { defineEventHandler, type Router, EventHandler, EventHandlerRequest } from 'h3'


const routes: Array<{ path: string; handler: EventHandler<EventHandlerRequest, any> }> = []
export function registerRoute(path: string): MethodDecorator  {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    routes.push({
        path,
        handler: descriptor.value
    })
    return descriptor
  }
}

export function applyRoutes(router: Router) {
    routes.forEach(({ path, handler }) => {
      router.post(path, defineEventHandler(handler))
    })
}
