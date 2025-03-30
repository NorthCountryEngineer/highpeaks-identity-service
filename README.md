# highpeaks-identity-service

The **High Peaks Identity Service** is responsible for user identity and access management within the High Peaks AI platform. It provides authentication and authorization functionality (e.g., issuing and validating JWT tokens, managing user accounts) that other services in the platform (such as the ML platform or DevOps agent) can leverage to secure operations. This service is designed as a standalone microservice that can be developed, tested, and deployed independently.

## Repository Structure

```text
highpeaks-identity-service/
├── README.md                   # Overview and usage instructions for the identity service
├── Dockerfile                  # Containerization instructions for the identity service
├── package.json                # Node.js dependencies and metadata
├── index.js                    # Main source code for the identity service (Express server)
├── charts/
│   └── highpeaks-identity/
│       ├── Chart.yaml          # Helm chart metadata for deploying the service
│       ├── values.yaml         # Default configurations for the Helm chart (e.g., image name/tag)
│       └── templates/
│           ├── deployment.yaml # Kubernetes Deployment for the identity service
│           └── service.yaml    # Kubernetes Service to expose the identity service
└── .github/
    └── workflows/
        └── ci.yml             # GitHub Actions workflow for CI (linting, build validation)
```

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
