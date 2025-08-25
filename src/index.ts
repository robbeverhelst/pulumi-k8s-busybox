import { Deployment } from '@pulumi/kubernetes/apps/v1'
import { Namespace, Service } from '@pulumi/kubernetes/core/v1'
import { Config } from '@pulumi/pulumi'

const config = new Config()
const namespaceName = config.get('namespace') ?? 'test'
const replicas = config.getNumber('replicas') ?? 1
const image = config.get('image') ?? 'busybox:1.36'
const message = config.get('message') ?? 'hello from busybox'
const intervalSeconds = config.getNumber('intervalSeconds') ?? 10

const ns = new Namespace('busybox-ns', {
  metadata: { name: namespaceName },
})

const appLabels = { app: 'busybox' }

const deployment = new Deployment('busybox-deploy', {
  metadata: { namespace: namespaceName },
  spec: {
    selector: { matchLabels: appLabels },
    replicas,
    template: {
      metadata: { labels: appLabels },
      spec: {
        containers: [
          {
            name: 'busybox',
            image,
            command: ['sh', '-c', `while true; do echo ${message}; sleep ${intervalSeconds}; done`],
          },
        ],
      },
    },
  },
})

const service = new Service('busybox-svc', {
  metadata: { namespace: namespaceName },
  spec: {
    type: 'ClusterIP',
    selector: appLabels,
    ports: [{ port: 80, targetPort: 8080, protocol: 'TCP', name: 'http' }],
  },
})

export const namespace = ns.metadata.name
export const name = deployment.metadata.name
export const serviceName = service.metadata.name
