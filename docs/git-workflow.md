# Git workflow

Branches
- `main`: production. Protected, PR only.
- `develop`: integration. Protected, PR only.
- `feature/*`, `fix/*`: branch from `develop`, merge back via PR.
- `hotfix/*`: branch from `main`, merge to `main` and `develop`.
- `release/*`: stabilisation before a release.

Everyday flow
```bash
git checkout develop && git pull
git checkout -b feature/builder-store
# work, then small conventional commits
git add -p
git commit -m "feat(builder): add Zustand store with undo/redo"
git push -u origin feature/builder-store
# open a PR into develop
```

Commit format: `type(scope): summary`. Types: feat, fix, docs, style, refactor, perf, test,
chore, ci. Husky runs lint-staged on commit and commitlint on the message.

Branch protection (GitHub, Settings > Branches): require a PR, require the `CI` check to pass,
and block force pushes on `main` and `develop`.
