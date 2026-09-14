/**
 * CLI de solo lectura: lista TODOS los artifacts de Actions guardados en
 * el repo (no solo de un run), con nombre, tamaño, fecha de creación y
 * si ya expiraron -- para decidir con criterio qué es seguro borrar
 * antes de limpiar el cupo lleno (ver ESTADO.md 2026-09-14). No borra
 * nada, solo lista.
 *
 * Usa el token automático de GitHub Actions (GITHUB_TOKEN, permisos de
 * solo lectura sobre el propio repo, ya disponible sin configurar nada
 * nuevo) -- no ZERNIO_API_KEY ni ningún otro secret.
 *
 * Uso: npx tsx subida/listar_artifacts.ts
 * Env: GITHUB_TOKEN, GITHUB_REPOSITORY (los pone GitHub Actions solo)
 */

type Artifact = {
  id: number;
  name: string;
  size_in_bytes: number;
  created_at: string;
  expires_at: string;
  expired: boolean;
  workflow_run?: {id: number; workflow_id: number} | null;
};

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) {
    console.error('Faltan GITHUB_TOKEN/GITHUB_REPOSITORY -- este script está pensado para correr en GitHub Actions.');
    process.exit(1);
  }

  const headers = {Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json'};
  const artifacts: Artifact[] = [];
  let pagina = 1;
  for (;;) {
    const resp = await fetch(`https://api.github.com/repos/${repo}/actions/artifacts?per_page=100&page=${pagina}`, {headers});
    if (!resp.ok) throw new Error(`GET /actions/artifacts HTTP ${resp.status}: ${await resp.text()}`);
    const data = (await resp.json()) as {total_count: number; artifacts: Artifact[]};
    artifacts.push(...data.artifacts);
    if (artifacts.length >= data.total_count || data.artifacts.length === 0) break;
    pagina++;
  }

  const totalBytes = artifacts.reduce((acc, a) => acc + a.size_in_bytes, 0);
  const vivos = artifacts.filter((a) => !a.expired);
  const vivosBytes = vivos.reduce((acc, a) => acc + a.size_in_bytes, 0);

  console.log(`Total histórico: ${artifacts.length} artifacts, ${(totalBytes / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Todavía VIVOS (cuentan para el cupo): ${vivos.length} artifacts, ${(vivosBytes / 1024 / 1024).toFixed(1)}MB\n`);

  // Agrupar por nombre para ver patrones (ej: "video" repetido de cada prueba)
  const porNombre = new Map<string, {cantidad: number; bytes: number}>();
  for (const a of vivos) {
    const actual = porNombre.get(a.name) ?? {cantidad: 0, bytes: 0};
    actual.cantidad++;
    actual.bytes += a.size_in_bytes;
    porNombre.set(a.name, actual);
  }
  console.log('Agrupado por nombre (solo los vivos):');
  for (const [nombre, info] of [...porNombre.entries()].sort((a, b) => b[1].bytes - a[1].bytes)) {
    console.log(`  ${nombre}: ${info.cantidad} artifacts, ${(info.bytes / 1024 / 1024).toFixed(1)}MB`);
  }

  console.log('\nDetalle completo (vivos, mas nuevo primero):');
  for (const a of vivos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())) {
    console.log(
      `  id=${a.id} nombre="${a.name}" ${(a.size_in_bytes / 1024 / 1024).toFixed(2)}MB creado=${a.created_at} expira=${a.expires_at} run=${a.workflow_run?.id ?? '?'}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
