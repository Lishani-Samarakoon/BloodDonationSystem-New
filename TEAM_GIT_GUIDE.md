# Team Git / GitHub Contribution Guide

Do not make one person commit the whole project under all three members' names. Each member should commit the work they genuinely own from their own GitHub account.

## Recommended final workflow

1. Pull the latest `main` branch.
2. Each member creates a branch for their work.
3. Copy/apply only the files related to that member's actual contribution.
4. Commit with that member's own Git identity.
5. Push the branch.
6. Open a Pull Request.
7. Review and merge to `main`.

Example branches:

```text
feature/auth-service-and-gateway
feature/donation-service
feature/bloodbank-service
feature/frontend-integration
fix/docker-and-testing
```

## Check Git identity before committing

```powershell
git config user.name
git config user.email
```

If it is wrong, set the member's own values:

```powershell
git config user.name "Member Name"
git config user.email "member-github-email@example.com"
```

## Check changes before commit

```powershell
git status
git diff
```

## Commit example

```powershell
git add bloodbank-service
git commit -m "Complete blood bank stock and request APIs"
git push -u origin feature/bloodbank-service
```

The commit message should describe real work. GitHub commit history and Pull Requests can then be used as genuine evidence in the report.
