#!/usr/bin/env bash
set -euo pipefail
cd /workspace/LinkedHome
npm ci
npm run bootstrap
npm run build
