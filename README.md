# highpeaks-identity-service

The **High Peaks Identity Service** repository encompasses both:

1. A **Node.js–based identity microservice** (for basic user management/JWT logic).
2. **Keycloak** (via Bitnami’s Helm chart) as a more advanced, standards-based Identity and Access Management (IAM) solution.

By default, you may choose to deploy either approach: the Node.js service alone, Keycloak alone, or both. Typically, **Keycloak** is recommended for enterprise-scale authentication (OIDC, SSO, Federation).

---

## Repository Structure

```plaintext
highpeaks-identity-service/
├── README.md                           # This file – instructions for devs
├── Dockerfile                          # Containerization of the Node.js identity microservice
├── package.json                        # Node.js dependencies/metadata
├── index.js                            # Main source code for the Node.js identity service (Express server)
├── charts/
│   └── highpeaks-identity/
│       ├── Chart.yaml                  # Helm chart metadata (Node.js service)
│       ├── values.yaml                 # Default Helm values (image name, service type, etc.)
│       └── templates/
│           ├── deployment.yaml         # K8s Deployment for the Node.js identity microservice
│           └── service.yaml            # K8s Service for the Node.js identity microservice
└── .github/
    └── workflows/
        └── ci.yml                     # GitHub Actions workflow for CI (linting, build checks)
```
# Node.js Identity Microservice
## Development Setup

Prerequisites: Node.js (≥14.x) and npm on your dev machine.

1. Install dependencies:

`npm install`

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
```
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

### Usage
The Node.js service is primarily a simple user endpoint (/health, /users). If you want advanced OIDC capabilities, see Keycloak below.

# Keycloak Deployment (Bitnami Helm Chart)
Keycloak is an open-source identity and access management solution providing OIDC, single sign-on, user federation, etc.

### Prerequisites
   * A running K8s cluster (e.g., a local Kind).

   * kubectl and helm installed.

   * A dedicated namespace (e.g., highpeaks-identity).

### Installation Steps

1. Add Bitnami Helm repo:

```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

2. Create the namespace (if not exists):

`kubectl create namespace highpeaks-identity`

3. Configure/verify your values.yaml for Keycloak if you’re overriding defaults (for example, disabling NodePort or switching to Ingress).

4. Install Keycloak:
```
helm upgrade --install keycloak bitnami/keycloak \
  --namespace highpeaks-identity \
  --set service.type=ClusterIP \
  --set ingress.enabled=true \
  [--values ... your custom overrides ...]
```

5. Port-forward or use an Ingress to access Keycloak:

`kubectl port-forward -n highpeaks-identity svc/keycloak 8080:80`

6. Then browse to http://localhost:8080/.

## Post-install
Admin credentials:
```
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








## Development Setup

**Prerequisites:** Node.js (≥14.x) and npm on your development machine (e.g., a MacBook with VSCode).

1. **Install dependencies:** Navigate to this repository's root directory and run `npm install` to install Express and any other dependencies.
2. **Run the service locally:** You can start the identity service for local testing by running:
   ```bash
   node index.js
   ```
   This will launch the Express server on port 80 (or a port specified by the `PORT` environment variable). You should see log output indicating the service is running. Test it by visiting `http://localhost:80/health` or `http://localhost:80/users` in your browser or via curl.
3. **Build the container image:** To containerize the service, ensure Docker is installed and running, then execute:
   ```bash
   docker build -t highpeaks-identity-service:latest .
   ```
   This builds a Docker image for the identity service. You can run it with:
   ```bash
   docker run -p 8081:80 highpeaks-identity-service:latest
   ```
   which maps the service to port 8081 on your machine for testing.

## Kubernetes Deployment (Helm Chart)

This repository includes a Helm chart (under `charts/highpeaks-identity`) to deploy the identity service to Kubernetes:
- The **Deployment** manifest runs the Node.js service container.
- The **Service** manifest exposes it internally within the cluster.
- By default, the chart assumes the Docker image tag `highpeaks-identity-service:latest`, which is convenient for local clusters (e.g., Kind) where the image can be loaded without a registry.

To deploy using Helm:
```bash
helm install identity-service charts/highpeaks-identity --values charts/highpeaks-identity/values.yaml
```
This will create a deployment and service in the current Kubernetes namespace (you may create a dedicated namespace like `highpeaks-identity` and use `-n highpeaks-identity`).

_For local testing on a Kind cluster_, ensure you've built the image and loaded it into the cluster (using `kind load docker-image highpeaks-identity-service:latest`). Then install the chart as above.

## CI/CD

We use GitHub Actions for basic Continuous Integration:
- The workflow (`.github/workflows/ci.yml`) is triggered on pushes and pull requests. It lints the code and validates the Kubernetes manifests.
- **Linting:** We could integrate ESLint for code style checks in future. Currently, the workflow ensures `npm install` runs without errors (catching any dependency issues).
- **Build Validation:** The workflow attempts to build the Docker image (without pushing) to verify that the Dockerfile and application compile successfully.
- (In a real project, we would also run unit tests and security scans here.)

On a successful merge to the main branch, the built image can be published to a container registry, and the Helm chart (or Kustomize manifests) can be deployed to a cluster via a GitOps tool or continuous deployment pipeline.

## Security & DevSecOps Notes

This identity service will be central to authentication across the platform. Future enhancements might include:
- Integration with an OIDC provider or directory service for enterprise-grade identity management.
- Storing secrets (like JWT signing keys) securely (for example, using Kubernetes Secrets, which can be managed via sealed-secrets or vault in a real deployment).
- Automated security scans (SAST/DAST) in the CI pipeline to detect vulnerabilities in dependencies or code.
