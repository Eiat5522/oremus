const REQUIRED_CHRISTIAN_MODEL_IDS = [
  'jesus_statue_a',
  'cross_wood_a',
  'bible_open_a',
  'candle_tall_a',
  'candle_short_a',
  'prayer_table_wood_a',
] as const;

export type ChristianPrayerCornerAssetId = (typeof REQUIRED_CHRISTIAN_MODEL_IDS)[number];

export interface ChristianPrayerCornerAssetManifestItem {
  id: ChristianPrayerCornerAssetId;
  fileName: string;
  pivot: 'bottomCenter' | 'center';
  role: 'hero' | 'support' | 'base';
  maxTriangles: number;
  maxTextureSize: 256 | 512 | 1024 | 2048;
  scaleHint: number;
}

export interface ChristianPrayerCornerManifest {
  version: 1;
  tradition: 'christian';
  profile: string;
  format: 'glb';
  notes?: string;
  assets: ChristianPrayerCornerAssetManifestItem[];
}

function assertRecord(input: unknown, label: string): asserts input is Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error(`${label} must be an object`);
  }
}

function assertString(input: unknown, label: string): asserts input is string {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertNumber(input: unknown, label: string): asserts input is number {
  if (typeof input !== 'number' || Number.isNaN(input)) {
    throw new Error(`${label} must be a valid number`);
  }
}

function isAssetId(value: string): value is ChristianPrayerCornerAssetId {
  return (REQUIRED_CHRISTIAN_MODEL_IDS as readonly string[]).includes(value);
}

export function getRequiredChristianModelIds(): readonly ChristianPrayerCornerAssetId[] {
  return REQUIRED_CHRISTIAN_MODEL_IDS;
}

export function parseChristianPrayerCornerManifest(input: unknown): ChristianPrayerCornerManifest {
  assertRecord(input, 'Manifest');
  assertString(input.tradition, 'Manifest tradition');
  assertString(input.profile, 'Manifest profile');
  assertString(input.format, 'Manifest format');

  if (input.version !== 1) {
    throw new Error('Manifest version must equal 1');
  }

  if (input.tradition !== 'christian') {
    throw new Error('Manifest tradition must equal christian');
  }

  if (input.format !== 'glb') {
    throw new Error('Manifest format must equal glb');
  }

  if (!Array.isArray(input.assets)) {
    throw new Error('Manifest assets must be an array');
  }

  const assets: ChristianPrayerCornerAssetManifestItem[] = input.assets.map((entry, index) => {
    assertRecord(entry, `Manifest asset #${index + 1}`);
    assertString(entry.id, `Manifest asset #${index + 1} id`);
    assertString(entry.fileName, `Manifest asset #${index + 1} fileName`);
    assertString(entry.pivot, `Manifest asset #${index + 1} pivot`);
    assertString(entry.role, `Manifest asset #${index + 1} role`);
    assertNumber(entry.maxTriangles, `Manifest asset #${index + 1} maxTriangles`);
    assertNumber(entry.maxTextureSize, `Manifest asset #${index + 1} maxTextureSize`);
    assertNumber(entry.scaleHint, `Manifest asset #${index + 1} scaleHint`);

    if (!isAssetId(entry.id)) {
      throw new Error(`Manifest asset #${index + 1} has unknown id ${entry.id}`);
    }

    if (entry.pivot !== 'bottomCenter' && entry.pivot !== 'center') {
      throw new Error(`Manifest asset #${index + 1} pivot must be bottomCenter or center`);
    }

    if (entry.role !== 'hero' && entry.role !== 'support' && entry.role !== 'base') {
      throw new Error(`Manifest asset #${index + 1} role must be hero, support, or base`);
    }

    if (![256, 512, 1024, 2048].includes(entry.maxTextureSize)) {
      throw new Error(
        `Manifest asset #${index + 1} maxTextureSize must be one of 256/512/1024/2048`,
      );
    }

    return {
      id: entry.id,
      fileName: entry.fileName,
      pivot: entry.pivot,
      role: entry.role,
      maxTriangles: entry.maxTriangles,
      maxTextureSize: entry.maxTextureSize as 256 | 512 | 1024 | 2048,
      scaleHint: entry.scaleHint,
    };
  });

  const availableIds = new Set(assets.map((asset) => asset.id));
  const missingIds = REQUIRED_CHRISTIAN_MODEL_IDS.filter((id) => !availableIds.has(id));

  if (missingIds.length > 0) {
    throw new Error(`Manifest is missing required asset ids: ${missingIds.join(', ')}`);
  }

  return {
    version: 1,
    tradition: 'christian',
    profile: input.profile,
    format: 'glb',
    notes: typeof input.notes === 'string' ? input.notes : undefined,
    assets,
  };
}
