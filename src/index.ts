import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const namespaceName = config.get("namespace") ?? "test";
const replicas = config.getNumber("replicas") ?? 1;
const image = config.get("image") ?? "busybox:1.36";
const message = config.get("message") ?? "hello from busybox";
const intervalSeconds = config.getNumber("intervalSeconds") ?? 10;

const ns = new k8s.core.v1.Namespace("busybox-ns", {
  metadata: { name: namespaceName },
});

const appLabels = { app: "busybox" };

const deployment = new k8s.apps.v1.Deployment("busybox-deploy", {
  metadata: { namespace: namespaceName },
  spec: {
    selector: { matchLabels: appLabels },
    replicas,
    template: {
      metadata: { labels: appLabels },
      spec: {
        containers: [
          {
            name: "busybox",
            image,
            command: [
              "sh",
              "-c",
              `while true; do echo ${message}; sleep ${intervalSeconds}; done`,
            ],
          },
        ],
      },
    },
  },
});

const service = new k8s.core.v1.Service("busybox-svc", {
  metadata: { namespace: namespaceName },
  spec: {
    type: "ClusterIP",
    selector: appLabels,
    ports: [{ port: 80, targetPort: 8080, protocol: "TCP", name: "http" }],
  },
});

export const namespace = ns.metadata.name;
export const name = deployment.metadata.name;
export const serviceName = service.metadata.name;
