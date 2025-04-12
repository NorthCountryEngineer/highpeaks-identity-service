# highpeaks-identity-service

The **High Peaks Identity Service** repository encompasses both:

1. A **Node.js–based identity microservice** (for basic user management/JWT logic).
2. **Keycloak** (via Bitnami’s Helm chart) as a more advanced, standards-based Identity and Access Management (IAM) solution.

By default, you may choose to deploy either approach: the Node.js service alone, Keycloak alone, or both. Typically, **Keycloak** is recommended for enterprise-scale authentication (OIDC, SSO, Federation).

---

## Repository Structure

```
highpeaks-identity-service/ 
├── README.md                 # This file – instructions for devs 
├── Dockerfile                # Containerization for the Node.js identity microservice 
├── package.json              # Node.js dependencies 
├── index.js                  # Main source code for Node.js identity service 
├── charts/ 
│ └── highpeaks-identity/ 
│ ├── Chart.yaml              # Helm chart for Node.js identity microservice 
│ ├── values.yaml             # Default Helm values (image, service config) 
│ └── templates/ 
│     ├── deployment.yaml     # Node.js service Deployment 
│     └── service.yaml        # Node.js service Service 
└── .github/ 
└── workflows/ 
└── ci.yml # GitHub Actions for lint/build checks
```
## 1. Node.js Identity Microservice

### Development Setup

**Prerequisites**: Node.js (≥14.x) and npm.

1. **Install Dependencies**:
```bash
npm install
```
2. Run locally:

`node index.js`

   * Launches on port 80 (or PORT env var).

   * Check http://localhost:80/health or http://localhost:80/users.

3. Build container image (requires Docker):

`docker build -t highpeaks-identity-service:latest .`

4. Run it locally:

`docker run -p 8081:80 highpeaks-identity-service:latest`

5. Then visit http://localhost:8081/health.

## Kubernetes Deployment (Helm Chart)

Within charts/highpeaks-identity, a Helm chart deploys this Node.js service onto Kubernetes.

1. Build & load the Docker image (if using a local Kind cluster):
```bash
docker build -t highpeaks-identity-service:latest .
kind load docker-image highpeaks-identity-service:latest --name highpeaks
```

2. Install the chart:
```
helm install identity-service charts/highpeaks-identity \
  --values charts/highpeaks-identity/values.yaml \
  -n highpeaks-identity
```

3.  Create the namespace if needed: kubectl create namespace highpeaks-identity.

Check:

`kubectl get pods -n highpeaks-identity`

You’ll see a pod named something like highpeaks-identity-service-xxxx.

4. Port Access: By default, service.type=ClusterIP. For local dev, you might:

Port-forward:

`kubectl port-forward -n highpeaks-identity svc/highpeaks-identity-service 8081:80`

Then open http://localhost:8081/health.

# Keycloak Deployment (Bitnami Helm Chart)
Keycloak is an open-source identity and access management solution providing OIDC, single sign-on, user federation, etc.

### Prerequisites
   * A running K8s cluster (e.g., a local Kind).

   * kubectl and helm installed.

   * A dedicated namespace (e.g., highpeaks-identity).

### Installation Steps

1. Add Bitnami Helm repo:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

2. Create the namespace (if not exists):

`kubectl create namespace highpeaks-identity`

3. Configure/verify your values.yaml for Keycloak if you’re overriding defaults (for example, disabling NodePort or switching to Ingress).

4. Install Keycloak:
```bash
helm upgrade --install keycloak bitnami/keycloak \
  --namespace highpeaks-identity \
  --set service.type=ClusterIP \
  --set ingress.enabled=true \
  [--values ... your custom overrides ...]
```
5. Access Keycloak:
Port-forward:

`kubectl port-forward -n highpeaks-identity svc/keycloak 8080:80`

Then http://localhost:8080

Or Ingress if using NGINX (e.g., keycloak.highpeaks.local + /etc/hosts).

6. Admin Credentials:
```bash
kubectl get secret --namespace highpeaks-identity keycloak \
  -o jsonpath="{.data.admin-user}" | base64 --decode ; echo
kubectl get secret --namespace highpeaks-identity keycloak \
  -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```
Then log in to the Keycloak admin console.



5. Port-forward or use an Ingress to access Keycloak:

`kubectl port-forward -n highpeaks-identity svc/keycloak 8080:80`

6. Then browse to http://localhost:8080/.

## Post-install
Admin credentials:
```bash
    kubectl get secret --namespace highpeaks-identity keycloak \
      -o jsonpath="{.data.admin-user}" | base64 --decode ; echo
    kubectl get secret --namespace highpeaks-identity keycloak \
      -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

Log in to the Keycloak admin console and create realms, roles, or federation settings.

Note: If you want to share the same namespace as the Node.js identity service, that’s fine—just ensure no port conflicts.

# CI/CD (GitHub Actions)
The .github/workflows/ci.yml pipeline in this repo:
   * Lints your Node.js code by running npm install.

   * Validates Kubernetes manifests (Helm templates) to catch YAML errors.

   * Does not push images by default. For advanced usage, integrate Docker pushes or security scans.

Upon successful merges, you can publish the Node.js identity image to your registry or rely on local builds if you’re using a local cluster like Kind.

# Security & DevSecOps Notes
Node.js Identity:
   * This microservice is minimal. For production, implement robust password hashing, session management, or integrate with Keycloak.

   * Keycloak:

      * Ensure you configure TLS (e.g., with an Ingress and Require SSL=all requests inside Keycloak).

      * Store admin passwords in sealed secrets or external vault solutions for better secret management.

   * RBAC:

      * Use separate K8s namespaces for identity, ml, etc., with limited roles.

# When to Use Node.js Identity vs. Keycloak

   * Node.js Identity is a simple example with /health and /users routes. If you need just a quick custom identity logic for small-scale or specialized use, it might suffice.

   * Keycloak is a full-featured IAM solution with SSO, OIDC, Federation, password policies, etc. Typically recommended for enterprise-level or complex identity scenarios.

You can decide whether to keep the Node.js service as a “lightweight identity” or rely solely on Keycloak for advanced functionality. Either way, the highpeaks-identity-service repo and chart serve as your base identity domain in the High Peaks AI platform.
# Troubleshooting

   * Port Conflicts: If NodePort conflicts with another microservice, switch Keycloak to service.type=ClusterIP + Ingress or adjust NodePort in values.yaml.

   * Cannot Access Keycloak:

      * Use kubectl port-forward -n highpeaks-identity svc/keycloak 8080:80.

      * Or set up an Ingress (Nginx or otherwise) to route http://keycloak.highpeaks.local.

   * Logs:

      * For Node.js identity: kubectl logs -n highpeaks-identity <pod-name>.

      * For Keycloak: kubectl logs -n highpeaks-identity keycloak-0 (StatefulSet pods).

# Next Steps

   * Update your environment with the chosen solution (Node.js or Keycloak) or run both if bridging custom logic to Keycloak’s OIDC.

   * Document your chosen approach for local dev vs. production.

   * Integrate with other microservices (ML, devops agent) so they use Keycloak or your identity JWT endpoints for authentication.