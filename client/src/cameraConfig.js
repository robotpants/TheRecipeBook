// Version v0.1.014 - Data Isolation Split
// This file contains all static data, constants, and configuration for The Recipe Book.

// --- APP CONSTANTS ---
export const APP_VERSION = 'v0.1.014';
export const RECIPES_COLLECTION_PATH = 'public_recipes'; 
export const SITE_TITLE = 'The Recipe Book'; 

// --- ADMIN CONFIGURATION ---
export const ADMIN_EMAILS = ['nick@thegoodok.com']; 

// --- HELPER FUNCTIONS FOR DATA GENERATION ---
const range = (start, end) => Array.from({length: end - start + 1}, (_, i) => (start + i).toString());
const plusRange = (start, end) => Array.from({length: end - start + 1}, (_, i) => (start + i) > 0 ? `+${start + i}` : (start + i).toString());

// --- STATIC DATA ---

export const BASE_PROFILES_BY_BRAND = {
    'Fujifilm': ['PROVIA/Standard', 'Velvia/Vivid', 'ASTIA/Soft', 'Classic Chrome', 'ETERNA/Cinema', 'ETERNA Bleach Bypass', 'Classic Neg.', 'Nostalgic Negative', 'ACROS', 'ACROS + Ye Filter', 'ACROS + R Filter', 'ACROS + G Filter', 'Black & White', 'B&W + Filter', 'Sepia', 'Reala ACE'],
    'Canon': ['Standard', 'Portrait', 'Landscape', 'Fine Detail', 'Neutral', 'Faithful', 'Monochrome'],
    'Nikon': ['Standard', 'Portrait', 'Landscape', 'Flat', 'Dream', 'Morning', 'Pop', 'Sunday', 'Somber', 'Dramatic', 'Silence', 'Bleached', 'Melancholic', 'Pure', 'Denim', 'Toy', 'Sepia', 'Blue', 'Red', 'Pink', 'Charcoal', 'Graphite', 'Binary', 'Carbon'],
    'Sony': ['ST (Standard)', 'PT (Portrait)', 'LA (Landscape)', 'VV (Vivid)', 'Clear', 'Deep', 'Light', 'M (Sepia)', 'W (Black/White)', 'Creative Look (FL)', 'Creative Look (IN)', 'Creative Look (SH)'],
    'Ricoh': ['Standard', 'Vivid', 'Monotone', 'Soft Monotone', 'Hard Monotone', 'Hi-Contrast B&W', 'Negative Film', 'Positive Film', 'Bleach Bypass', 'Retro', 'HDR Tone', 'Cross Process'],
    'Olympus/OM': ['i-Enhance', 'Vivid', 'Natural', 'Muted', 'Portrait', 'Monotone', 'Custom1', 'Custom2', 'Sepia', 'Art Filter (Various)']
};

export const BRAND_SPECIFIC_OPTIONS = {
    'Fujifilm': {
        whiteBalance: ['Auto', 'Custom', 'Color Temperature (K)', 'Daylight', 'Shade', 'Fluorescent 1', 'Fluorescent 2', 'Fluorescent 3', 'Incandescent', 'Underwater'],
        dynamicRange: ['DR100', 'DR200', 'DR400', 'DR-P (Strong)', 'DR-P (Weak)', 'Auto', 'Off'],
        highlightTone: plusRange(-2, 4),
        shadowTone: plusRange(-2, 4),
        colorSaturation: plusRange(-4, 4),
        sharpness: plusRange(-4, 4),
        noiseReduction: plusRange(-4, 4),
        clarity: plusRange(-5, 5),
        grainEffect: ['Off', 'Weak Small', 'Weak Large', 'Strong Small', 'Strong Large'],
        chromeEffect: ['Off', 'Weak', 'Strong'],
        chromeBlue: ['Off', 'Weak', 'Strong'],
    },
    'Nikon': {
        whiteBalance: ['Auto', 'Natural Light Auto', 'Direct Sunlight', 'Cloudy', 'Shade', 'Incandescent', 'Fluorescent', 'Flash', 'Choose Color Temp', 'Preset Manual'],
        dynamicRange: ['Auto', 'Extra High', 'High', 'Normal', 'Low', 'Off'], // ADL
        sharpening: range(0, 9),
        clarity: plusRange(-5, 5),
        contrast: plusRange(-3, 3),
        brightness: plusRange(-5, 5),
        saturation: plusRange(-3, 3),
        hue: plusRange(-3, 3),
        noiseReduction: ['Off', 'Low', 'Normal', 'High']
    },
    'Canon': {
        whiteBalance: ['Auto', 'Daylight', 'Shade', 'Cloudy', 'Tungsten', 'White Fluorescent', 'Flash', 'Custom', 'Color Temp'],
        dynamicRange: ['Disable', 'Low', 'Standard', 'High'], // ALO
        sharpness: range(0, 7),
        contrast: range(-4, 4),
        saturation: range(-4, 4),
        colorTone: range(-4, 4),
        noiseReduction: ['Disable', 'Low', 'Standard', 'High', 'Multi Shot'],
        clarity: range(-4, 4)
    },
    'Sony': {
        whiteBalance: ['Auto', 'Daylight', 'Shade', 'Cloudy', 'Incandescent', 'Fluor.: Warm White', 'Fluor.: Cool White', 'Fluor.: Day White', 'Fluor.: Daylight', 'Flash', 'Underwater', 'C.Temp./Filter', 'Custom'],
        dynamicRange: ['Off', 'Auto', 'Lv1', 'Lv2', 'Lv3', 'Lv4', 'Lv5'], // DRO
        sharpness: range(0, 9),
        clarity: range(0, 9),
        noiseReduction: ['Off', 'Low', 'Normal'],
        highlightTone: range(-9, 9),
        shadowTone: range(-9, 9),
        colorSaturation: range(-9, 9)
    },
    'Ricoh': {
        whiteBalance: ['Auto', 'Multi Auto', 'Daylight', 'Shade', 'Cloudy', 'Fl. Daylight', 'Fl. Neutral White', 'Fl. Cool White', 'Fl. Warm White', 'Tungsten', 'CTE', 'Manual', 'Color Temp'],
        dynamicRange: ['Off', 'Auto', 'Weak', 'Medium', 'Strong'],
        sharpness: range(-4, 4),
        contrast: range(-4, 4),
        clarity: range(-4, 4),
        highlightTone: range(-4, 4),
        shadowTone: range(-4, 4),
        colorSaturation: range(-4, 4),
        noiseReduction: ['Off', 'Low', 'High', 'Auto']
    },
    'Olympus/OM': {
        whiteBalance: ['Auto', 'Sunny', 'Shadow', 'Cloudy', 'Incandescent', 'Fluorescent', 'Underwater', 'Flash', 'Custom', 'Color Temp'],
        dynamicRange: ['Auto', 'Normal', 'High Key', 'Low Key'],
        highlightTone: range(-7, 7),
        shadowTone: range(-7, 7),
        sharpness: range(-2, 2),
        colorSaturation: range(-2, 2),
        noiseReduction: ['Off', 'Low', 'Standard', 'High']
    }
};

export const ALL_BRANDS = Object.keys(BASE_PROFILES_BY_BRAND);
export const DEFAULT_BRAND = 'Fujifilm'; 

export const BRAND_MODELS = {
    'Fujifilm': ['X100VI', 'X100V', 'X-T5', 'X-T4', 'X-H2S', 'X-H2', 'X-S20', 'X-S10', 'X-Pro3', 'X-E4', 'X-T30 II', 'X-T30', 'GFX 100 II', 'GFX 50S II', 'GFX 100S'],
    'Canon': ['EOS R3', 'EOS R5', 'EOS R6 II', 'EOS R6', 'EOS R8', 'EOS R7', 'EOS R10', 'EOS R50', 'EOS R', 'EOS RP', 'EOS 90D', 'EOS M50 II', 'EOS M6 II'],
    'Nikon': ['Z9', 'Z8', 'Z7 II', 'Z6 II', 'Zf', 'Zfc', 'Z5', 'Z50', 'Z30', 'D850', 'D780', 'D500'],
    'Sony': ['A1', 'A9 III', 'A7S III', 'A7R V', 'A7R IV', 'A7 IV', 'A7C II', 'A7CR', 'A6700', 'A6600', 'ZV-E10', 'ZV-1 II'],
    'Ricoh': ['GR IIIx', 'GR III', 'GR II'],
    'Olympus/OM': ['OM-1 II', 'OM-1', 'OM-5', 'E-M1 Mark III', 'E-M5 Mark III', 'E-M10 Mark IV'],
};

export const IMAGE_CONFIG = { maxWidth: 800, quality: 0.75, maxInputSizeMB: 10, outputFormat: 'image/jpeg' };

export const CORE_PARAMS_MAP = [
  { key: 'baseProfile', genericLabel: 'Base Profile / Simulation', labels: { 'Fujifilm': 'Film Simulation', 'Canon': 'Picture Style', 'Nikon': 'Picture Control', 'Sony': 'Creative Style / Look', 'Ricoh': 'Image Control', 'Olympus/OM': 'Picture Mode' }},
  { key: 'dynamicRange', genericLabel: 'Dynamic Range', labels: { 'Fujifilm': 'DR Setting', 'Canon': 'ALO', 'Nikon': 'ADL', 'Sony': 'DRO / HDR', 'Ricoh': 'DR Comp.', 'Olympus/OM': 'Gradation' }},
  { key: 'whiteBalance', genericLabel: 'White Balance', labels: { 'Fujifilm': 'WB Preset', 'Canon': 'WB Preset', 'Nikon': 'WB Preset', 'Sony': 'WB Preset', 'Ricoh': 'WB Preset', 'Olympus/OM': 'WB Preset' }},
  { key: 'wbShift', genericLabel: 'WB Shift', labels: { 'Fujifilm': 'WB Shift', 'Canon': 'Color Tone', 'Nikon': 'WB Adjust', 'Sony': 'Color Phase', 'Ricoh': 'WB Adj', 'Olympus/OM': 'WB Custom Adj' }},
  { key: 'highlightTone', genericLabel: 'Highlights', labels: { 'Fujifilm': 'Highlight Tone', 'Canon': 'Contrast (Hi)', 'Nikon': 'Highlights', 'Sony': 'Highlights', 'Ricoh': 'Contrast (Hi)', 'Olympus/OM': 'Highlight' }},
  { key: 'shadowTone', genericLabel: 'Shadows', labels: { 'Fujifilm': 'Shadow Tone', 'Canon': 'Contrast (Lo)', 'Nikon': 'Shadows', 'Sony': 'Shadows', 'Ricoh': 'Contrast (Lo)', 'Olympus/OM': 'Shadow' }},
  { key: 'colorSaturation', genericLabel: 'Color', labels: { 'Fujifilm': 'Color', 'Canon': 'Saturation', 'Nikon': 'Saturation', 'Sony': 'Saturation', 'Ricoh': 'Saturation', 'Olympus/OM': 'Color' }},
  { key: 'sharpness', genericLabel: 'Sharpness', labels: { 'Fujifilm': 'Sharpness', 'Canon': 'Sharpness', 'Nikon': 'Sharpening', 'Sony': 'Sharpening', 'Ricoh': 'Sharpness', 'Olympus/OM': 'Sharpness' }},
  { key: 'noiseReduction', genericLabel: 'Noise Reduction', labels: { 'Fujifilm': 'High ISO NR', 'Canon': 'High ISO NR', 'Nikon': 'High ISO NR', 'Sony': 'High ISO NR', 'Ricoh': 'High ISO NR', 'Olympus/OM': 'Noise Filter' }},
  { key: 'clarity', genericLabel: 'Clarity', labels: { 'Fujifilm': 'Clarity', 'Canon': 'Clarity', 'Nikon': 'Clarity', 'Sony': 'Clarity', 'Ricoh': 'Clarity', 'Olympus/OM': 'Midtones' }},
  
  // --- BRAND SPECIFIC FIELDS ---
  { key: 'grainEffect', genericLabel: 'Grain Effect', supportedBrands: ['Fujifilm'], labels: { 'Fujifilm': 'Grain Effect' } },
  { key: 'chromeEffect', genericLabel: 'Color Chrome Effect', supportedBrands: ['Fujifilm'], labels: { 'Fujifilm': 'Color Chrome Effect' } },
  { key: 'chromeBlue', genericLabel: 'Color Chrome FX Blue', supportedBrands: ['Fujifilm'], labels: { 'Fujifilm': 'Color Chrome FX Blue' } },
];

// --- CONFIG HELPERS ---

export const getLabelForBrand = (key, brand) => {
  const param = CORE_PARAMS_MAP.find(p => p.key === key);
  if (!param) return key;
  return param.labels[brand] || param.genericLabel.split('/')[0].trim();
};

export const isFieldVisible = (param, currentBrand) => {
    if (!param.supportedBrands) return true; 
    return param.supportedBrands.includes(currentBrand);
};

export const formatBrandName = (brand) => {
    if (brand === 'Olympus/OM System') return 'Olympus/OM';
    return brand;
};

export const initialFormState = {
  name: '', brand: DEFAULT_BRAND, model: BRAND_MODELS[DEFAULT_BRAND][0], notes: '', imageUrl: '', endorserIds: [],
  baseProfile: BASE_PROFILES_BY_BRAND[DEFAULT_BRAND][0],
  ...CORE_PARAMS_MAP.filter(p => p.key !== 'baseProfile').reduce((acc, param) => ({ ...acc, [param.key]: '' }), {}),
};