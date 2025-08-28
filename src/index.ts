import { App, config } from '@homelab/shared'

const cfg = config('busybox')

const app = new App('busybox', {
  namespace: cfg.get('namespace', 'test'),
  image: process.env.BUSYBOX_VERSION || cfg.get('image'),
  ports: [{ name: 'http', containerPort: 8080, servicePort: 80 }],
  env: [
    { name: 'MESSAGE', value: cfg.get('message', 'hello from busybox') },
    { name: 'INTERVAL', value: cfg.get('interval', '10') },
  ],
  resources: {
    requests: { cpu: '10m', memory: '16Mi' },
    limits: { cpu: '100m', memory: '128Mi' },
  },
})

export const namespace = app.namespace.metadata.name
export const deployment = app.deployment.metadata.name
export const service = app.service?.metadata.name
