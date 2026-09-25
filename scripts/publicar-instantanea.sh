#!/usr/bin/env bash
# Regenera la instantanea estatica y la publica en GitHub Pages (rama gh-pages).
# Requisitos: `npm run db:dev` corriendo y la semilla cargada.
#   npm run instantanea
set -euo pipefail

npm run build
npx tsx scripts/instantanea.ts

tmp=$(mktemp -d)
git worktree add "$tmp" gh-pages
trap 'git worktree remove --force "$tmp"' EXIT

find "$tmp" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r .instantanea/. "$tmp/"
git -C "$tmp" add -A
if git -C "$tmp" diff --cached --quiet; then
  echo "Sin cambios: la instantanea publicada ya esta al dia."
  exit 0
fi
git -C "$tmp" commit -q -m "Instantanea de ClickPass ($(git rev-parse --short HEAD))"
git -C "$tmp" push -q origin gh-pages
echo "Publicado: https://kzaldasp.github.io/clickpass-invitaciones/ (tarda 1-2 minutos en verse)"
