# Guide de déploiement EcoRide

## Configuration Git - Double Remote

Le projet EcoRide est configuré pour pousser automatiquement vers **deux remotes** :

### Remotes configurés

```bash
# GitHub (public, pour ECF)
origin (fetch): https://github.com/halajarin/StudyProject.git

# Azure DevOps (entreprise, pour pipelines CI/CD)
azure: https://dev.azure.com/clauger3e/MyPortal3E/_git/Ecoride
```

### Commandes Git

**Push vers les deux remotes** (recommandé) :
```bash
git push origin main
# Pousse automatiquement vers GitHub ET Azure DevOps
```

**Push vers un seul remote** :
```bash
# Uniquement GitHub
git push origin main --no-all

# Uniquement Azure DevOps
git push azure main
```

**Vérifier la configuration** :
```bash
git remote -v
```

---

## Pipelines Azure DevOps

### Localisation des fichiers

**Backend** :
- `EcoRide.Backend/pipe/deploy.yaml` - Déploiement production
- `EcoRide.Backend/pipe/pr-validation.yaml` - Validation des PRs

**Frontend** :
- `EcoRide.Frontend/pipe/deploy.yaml` - Déploiement production
- `EcoRide.Frontend/pipe/pr-validation.yaml` - Validation des PRs

### Configuration Azure DevOps

1. **Créer les pipelines** :
   - Azure DevOps → Pipelines → New Pipeline
   - Sélectionner "Azure Repos Git"
   - Choisir le repo `Ecoride`
   - Existing Azure Pipelines YAML file
   - Sélectionner un des 4 fichiers pipe/*.yaml

2. **Configurer les variables** :
   - Azure DevOps → Pipelines → Library
   - Créer un groupe `Common`
   - Ajouter les variables d'environnement nécessaires

3. **Configurer SonarCloud** :
   - Service Connection pour SonarCloud
   - Organization : `clauger3e-sonarcloud`
   - Project Keys :
     - Backend : `halajarin_EcoRide`
     - Frontend : `halajarin_EcoRide_Frontend`

4. **Configurer Kubernetes** :
   - Service Connection pour Kubernetes
   - Ajouter le kubeconfig de votre cluster

5. **Configurer Docker Registry** :
   - Service Connection pour Docker Hub ou ACR
   - Images :
     - Backend : `ecoride/backend-api`
     - Frontend : `ecoride/frontend`

### Déclenchement des pipelines

**Deploy pipelines** :
- Se déclenchent automatiquement sur push vers `main` ou `dev`
- Excluent les fichiers `*.md` et `pipe/*`

**PR validation pipelines** :
- Se déclenchent automatiquement sur Pull Request vers `main` ou `dev`
- Exécutent les tests et analyses SonarCloud

---

## Architecture de déploiement

### Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Backend | .NET | 9.0 |
| Frontend | Angular | 20 |
| Base de données | PostgreSQL | Latest |
| NoSQL | MongoDB | Latest |
| Orchestration | Kubernetes | - |
| CI/CD | Azure Pipelines | - |
| Qualité code | SonarCloud | - |

### Environnements

**Développement** (`dev` branch) :
- GitOps Path : `dev/ecoride-backend`, `dev/ecoride-frontend`
- Namespace K8s : `ecoride-dev`

**Production** (`main` branch) :
- GitOps Path : `prod/ecoride-backend`, `prod/ecoride-frontend`
- Namespace K8s : `ecoride-prod`

---

## Tests

### Backend (.NET)

```bash
cd EcoRide.Backend
dotnet test
```

**39 tests unitaires** couvrant :
- Repositories (UserRepository, CarpoolRepository, ReviewRepository)
- Services (AuthService, CarpoolService)
- Controllers

### Frontend (Angular)

```bash
cd EcoRide.Frontend
npm run test
```

**22+ tests unitaires** couvrant :
- Services (CarpoolService, ReviewService)
- Guards (AuthGuard)

---

## Déploiement Kubernetes

### Prérequis

1. **Cluster Kubernetes configuré**
2. **kubectl installé et configuré**
3. **Manifests Kubernetes créés** :
   - Backend : deployment, service, configmap, secrets
   - Frontend : deployment, service
   - PostgreSQL : statefulset, service, PVC
   - MongoDB : statefulset, service, PVC

### Structure GitOps

```
k8s/
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
├── frontend/
│   ├── deployment.yaml
│   └── service.yaml
├── database/
│   ├── postgres-statefulset.yaml
│   ├── postgres-service.yaml
│   ├── postgres-pvc.yaml
│   ├── mongodb-statefulset.yaml
│   ├── mongodb-service.yaml
│   └── mongodb-pvc.yaml
└── ingress/
    └── ingress.yaml
```

### Commandes de déploiement manuel

**Appliquer tous les manifests** :
```bash
kubectl apply -f k8s/
```

**Vérifier le déploiement** :
```bash
kubectl get pods -n ecoride-prod
kubectl get services -n ecoride-prod
kubectl logs -f deployment/ecoride-backend -n ecoride-prod
```

**Accéder aux logs** :
```bash
# Backend
kubectl logs -f deployment/ecoride-backend -n ecoride-prod

# Frontend
kubectl logs -f deployment/ecoride-frontend -n ecoride-prod
```

---

## Variables d'environnement

### Backend

```bash
# PostgreSQL
POSTGRES_HOST=postgres-service
POSTGRES_PORT=5432
POSTGRES_DB=ecoride
POSTGRES_USER=ecoride_user
POSTGRES_PASSWORD=<secret>

# MongoDB
MONGODB_HOST=mongodb-service
MONGODB_PORT=27017
MONGODB_DB=ecoride_preferences

# JWT
JWT_SECRET=<secret>
JWT_ISSUER=EcoRide
JWT_AUDIENCE=EcoRideUsers

# Email (si configuré)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<secret>
```

### Frontend

```bash
# API Backend URL
API_URL=https://api.ecoride.example.com

# Environnement
ENVIRONMENT=production
```

---

## Monitoring et Logs

### SonarCloud

- **Dashboard Backend** : https://sonarcloud.io/dashboard?id=halajarin_EcoRide
- **Dashboard Frontend** : https://sonarcloud.io/dashboard?id=halajarin_EcoRide_Frontend

### Kubernetes

**Prometheus + Grafana** (si configurés) :
```bash
kubectl port-forward -n monitoring service/grafana 3000:80
# Accéder à http://localhost:3000
```

**Logs centralisés** (ELK stack si configuré) :
```bash
kubectl port-forward -n logging service/kibana 5601:5601
# Accéder à http://localhost:5601
```

---

## Rollback

### Via Azure DevOps

1. Pipelines → Sélectionner le pipeline de déploiement
2. Runs → Sélectionner une version précédente
3. Rerun

### Via Kubernetes

```bash
# Voir l'historique des déploiements
kubectl rollout history deployment/ecoride-backend -n ecoride-prod

# Rollback vers la version précédente
kubectl rollout undo deployment/ecoride-backend -n ecoride-prod

# Rollback vers une révision spécifique
kubectl rollout undo deployment/ecoride-backend --to-revision=2 -n ecoride-prod
```

---

## Troubleshooting

### Pipeline échoue

1. **Vérifier les logs Azure Pipelines**
2. **Vérifier les Service Connections** (SonarCloud, Kubernetes, Docker)
3. **Vérifier les variables du groupe `Common`**

### Pod en CrashLoopBackOff

```bash
# Voir les logs
kubectl logs <pod-name> -n ecoride-prod

# Décrire le pod
kubectl describe pod <pod-name> -n ecoride-prod

# Vérifier les secrets/configmaps
kubectl get secrets -n ecoride-prod
kubectl get configmaps -n ecoride-prod
```

### Base de données inaccessible

```bash
# Vérifier que PostgreSQL est en running
kubectl get pods -l app=postgres -n ecoride-prod

# Tester la connexion
kubectl exec -it <backend-pod> -n ecoride-prod -- psql -h postgres-service -U ecoride_user -d ecoride
```

---

## Sécurité

### Secrets Kubernetes

**Créer les secrets** :
```bash
kubectl create secret generic ecoride-backend-secrets \
  --from-literal=postgres-password=<password> \
  --from-literal=jwt-secret=<secret> \
  --from-literal=smtp-password=<password> \
  -n ecoride-prod
```

### Mise à jour des secrets

```bash
kubectl delete secret ecoride-backend-secrets -n ecoride-prod
kubectl create secret generic ecoride-backend-secrets \
  --from-literal=postgres-password=<new-password> \
  ... \
  -n ecoride-prod

# Redémarrer les pods pour prendre en compte les nouveaux secrets
kubectl rollout restart deployment/ecoride-backend -n ecoride-prod
```

---

## Contact et Support

- **GitHub** : https://github.com/halajarin/StudyProject
- **Azure DevOps** : https://dev.azure.com/clauger3e/MyPortal3E/_git/Ecoride

---

**Document créé le 24 janvier 2026**
**Version 1.0**
