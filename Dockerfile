# Veristat backend image — builds the pnpm workspace and runs one of the Node
# services (worker / score-api / mock-asps). Each Railway service uses this same
# image and overrides the start command. The Next.js web app is NOT built here
# (it deploys to Vercel).
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app

# Copy the whole workspace and install with the committed lockfile.
COPY . .
RUN pnpm install --frozen-lockfile

# Build only the backend packages/apps and their workspace dependencies.
RUN pnpm --filter @veristat/mock-asps... \
         --filter @veristat/score-api... \
         --filter @veristat/worker... \
         build

ENV NODE_ENV=production
# All three Railway services share this image and differ only by SERVICE_ENTRY:
#   score-api  -> apps/score-api/dist/main.js   (default)
#   mock-asps  -> demo/mock-asps/dist/main.js
#   worker     -> apps/worker/dist/main.js
CMD ["sh", "-c", "node ${SERVICE_ENTRY:-apps/score-api/dist/main.js}"]
