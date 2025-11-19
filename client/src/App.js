import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, addDoc, setDoc, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { Camera, Image as ImageIcon, PlusCircle, Aperture, Search, Zap, UploadCloud, X, Settings, Bookmark, Star, BookOpen, MoreVertical, Edit, Trash2, Bug, AlertTriangle, Info } from 'lucide-react';

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDwNm5YCEjmkVIjTbj9qvlj5KOptuEld48",
  authDomain: "the-recipe-book-5408d.firebaseapp.com",
  projectId: "the-recipe-book-5408d",
  storageBucket: "the-recipe-book-5408d.firebasestorage.app",
  messagingSenderId: "588030553446",
  appId: "1:588030553446:web:a42b35f7f06326446baca7",
  measurementId: "G-N5QVD88JG9"
};

// ---------------------------------------
// 1. CONSTANTS & DATA MODELS
// ---------------------------------------
const appId = 'default-app-id';
const RECIPES_COLLECTION_PATH = 'public_recipes'; 
const SITE_TITLE = 'The Recipe Book'; 

// Helper to generate number ranges
const range = (start, end) => Array.from({length: end - start + 1}, (_, i) => (start + i).toString());
const plusRange = (start, end) => Array.from({length: end - start + 1}, (_, i) => (start + i) > 0 ? `+${start + i}` : (start + i).toString());

const BASE_PROFILES_BY_BRAND = {
    'Fujifilm': ['PROVIA/Standard', 'Velvia/Vivid', 'ASTIA/Soft', 'Classic Chrome', 'ETERNA/Cinema', 'ETERNA Bleach Bypass', 'Classic Neg.', 'Nostalgic Negative', 'ACROS', 'ACROS + Ye Filter', 'ACROS + R Filter', 'ACROS + G Filter', 'Black & White', 'B&W + Filter', 'Sepia', 'Reala ACE'],
    'Canon': ['Standard', 'Portrait', 'Landscape', 'Fine Detail', 'Neutral', 'Faithful', 'Monochrome'],
    'Nikon': ['Standard', 'Portrait', 'Landscape', 'Flat', 'Dream', 'Morning', 'Pop', 'Sunday', 'Somber', 'Dramatic', 'Silence', 'Bleached', 'Melancholic', 'Pure', 'Denim', 'Toy', 'Sepia', 'Blue', 'Red', 'Pink', 'Charcoal', 'Graphite', 'Binary', 'Carbon'],
    'Sony': ['ST (Standard)', 'PT (Portrait)', 'LA (Landscape)', 'VV (Vivid)', 'Clear', 'Deep', 'Light', 'M (Sepia)', 'W (Black/White)', 'Creative Look (FL)', 'Creative Look (IN)', 'Creative Look (SH)'],
    'Ricoh': ['Standard', 'Vivid', 'Monotone', 'Soft Monotone', 'Hard Monotone', 'Hi-Contrast B&W', 'Negative Film', 'Positive Film', 'Bleach Bypass', 'Retro', 'HDR Tone', 'Cross Process'],
    'Olympus/OM System': ['i-Enhance', 'Vivid', 'Natural', 'Muted', 'Portrait', 'Monotone', 'Custom1', 'Custom2', 'Sepia', 'Art Filter (Various)']
};

// --- SMART OPTIONS PER BRAND ---
const BRAND_SPECIFIC_OPTIONS = {
    'Fujifilm': {
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
        dynamicRange: ['Auto', 'Extra High', 'High', 'Normal', 'Low', 'Off'],
        sharpening: range(0, 9),
        clarity: plusRange(-5, 5),
        contrast: plusRange(-3, 3),
        brightness: plusRange(-5, 5),
        saturation: plusRange(-3, 3),
        hue: plusRange(-3, 3),
        noiseReduction: ['Off', 'Low', 'Normal', 'High']
    },
    'Canon': {
        dynamicRange: ['Disable', 'Low', 'Standard', 'High'],
        sharpness: range(0, 7),
        contrast: range(-4, 4),
        saturation: range(-4, 4),
        colorTone: range(-4, 4),
        noiseReduction: ['Disable', 'Low', 'Standard', 'High', 'Multi Shot']
    },
    'Sony': {
        dynamicRange: ['Off', 'Auto', 'Lv1', 'Lv2', 'Lv3', 'Lv4', 'Lv5'],
        sharpness: range(0, 9),
        clarity: range(0, 9),
        noiseReduction: ['Off', 'Low', 'Normal']
    },
    'Ricoh': {
        dynamicRange: ['Off', 'Auto', 'Weak', 'Medium', 'Strong'],
        sharpness: range(-4, 4),
        contrast: range(-4, 4),
        clarity: range(-4, 4),
    }
};

const ALL_BRANDS = Object.keys(BASE_PROFILES_BY_BRAND);
const DEFAULT_BRAND = 'Fujifilm'; 

const BRAND_MODELS = {
    'Fujifilm': ['X100VI', 'X100V', 'X-T5', 'X-T4', 'X-H2S', 'X-H2', 'X-S20', 'X-S10', 'X-Pro3', 'X-E4', 'X-T30 II', 'X-T30', 'GFX 100 II', 'GFX 50S II', 'GFX 100S'],
    'Canon': ['EOS R3', 'EOS R5', 'EOS R6 II', 'EOS R6', 'EOS R8', 'EOS R7', 'EOS R10', 'EOS R50', 'EOS R', 'EOS RP', 'EOS 90D', 'EOS M50 II', 'EOS M6 II'],
    'Nikon': ['Z9', 'Z8', 'Z7 II', 'Z6 II', 'Zf', 'Zfc', 'Z5', 'Z50', 'Z30', 'D850', 'D780', 'D500'],
    'Sony': ['A1', 'A9 III', 'A7S III', 'A7R V', 'A7R IV', 'A7 IV', 'A7C II', 'A7CR', 'A6700', 'A6600', 'ZV-E10', 'ZV-1 II'],
    'Ricoh': ['GR IIIx', 'GR III', 'GR II'],
    'Olympus/OM System': ['OM-1 II', 'OM-1', 'OM-5', 'E-M1 Mark III', 'E-M5 Mark III', 'E-M10 Mark IV'],
};

const IMAGE_CONFIG = { maxWidth: 800, quality: 0.75, maxInputSizeMB: 10, outputFormat: 'image/jpeg' };

// --- UPDATED: BRAND AWARENESS IN PARAMS ---
const CORE_PARAMS_MAP = [
  { key: 'baseProfile', genericLabel: 'Base Profile / Simulation', labels: { 'Fujifilm': 'Film Simulation', 'Canon': 'Picture Style', 'Nikon': 'Picture Control', 'Sony': 'Creative Style / Look', 'Ricoh': 'Image Control', 'Olympus/OM System': 'Picture Mode' }},
  { key: 'dynamicRange', genericLabel: 'Dynamic Range', labels: { 'Fujifilm': 'DR Setting', 'Canon': 'ALO', 'Nikon': 'ADL', 'Sony': 'DRO / HDR', 'Ricoh': 'DR Comp.', 'Olympus/OM System': 'Gradation' }},
  { key: 'whiteBalance', genericLabel: 'White Balance', labels: { 'Fujifilm': 'WB Preset', 'Canon': 'WB Preset', 'Nikon': 'WB Preset', 'Sony': 'WB Preset', 'Ricoh': 'WB Preset', 'Olympus/OM System': 'WB Preset' }},
  { key: 'wbShift', genericLabel: 'WB Shift', labels: { 'Fujifilm': 'WB Shift', 'Canon': 'Color Tone', 'Nikon': 'WB Adjust', 'Sony': 'Color Phase', 'Ricoh': 'WB Adj', 'Olympus/OM System': 'WB Custom Adj' }},
  { key: 'highlightTone', genericLabel: 'Highlights', labels: { 'Fujifilm': 'Highlight Tone', 'Canon': 'Contrast (Hi)', 'Nikon': 'Highlights', 'Sony': 'Highlights', 'Ricoh': 'Contrast (Hi)', 'Olympus/OM System': 'Highlight' }},
  { key: 'shadowTone', genericLabel: 'Shadows', labels: { 'Fujifilm': 'Shadow Tone', 'Canon': 'Contrast (Lo)', 'Nikon': 'Shadows', 'Sony': 'Shadows', 'Ricoh': 'Contrast (Lo)', 'Olympus/OM System': 'Shadow' }},
  { key: 'colorSaturation', genericLabel: 'Color', labels: { 'Fujifilm': 'Color', 'Canon': 'Saturation', 'Nikon': 'Saturation', 'Sony': 'Saturation', 'Ricoh': 'Saturation', 'Olympus/OM System': 'Color' }},
  { key: 'sharpness', genericLabel: 'Sharpness', labels: { 'Fujifilm': 'Sharpness', 'Canon': 'Sharpness', 'Nikon': 'Sharpening', 'Sony': 'Sharpening', 'Ricoh': 'Sharpness', 'Olympus/OM System': 'Sharpness' }},
  { key: 'noiseReduction', genericLabel: 'Noise Reduction', labels: { 'Fujifilm': 'High ISO NR', 'Canon': 'High ISO NR', 'Nikon': 'High ISO NR', 'Sony': 'High ISO NR', 'Ricoh': 'High ISO NR', 'Olympus/OM System': 'Noise Filter' }},
  { key: 'clarity', genericLabel: 'Clarity', labels: { 'Fujifilm': 'Clarity', 'Canon': 'Clarity', 'Nikon': 'Clarity', 'Sony': 'Clarity', 'Ricoh': 'Clarity', 'Olympus/OM System': 'Midtones' }},
  
  // --- BRAND SPECIFIC FIELDS ---
  { key: 'grainEffect', genericLabel: 'Grain Effect', supportedBrands: ['Fujifilm'], labels: { 'Fujifilm': 'Grain Effect' } },
  { key: 'chromeEffect', genericLabel: 'Color Chrome Effect', supportedBrands: ['Fujifilm'], labels: { 'Fujifilm': 'Color Chrome Effect' } },
  { key: 'chromeBlue', genericLabel: 'Color Chrome FX Blue', supportedBrands: ['Fujifilm'], labels: { 'Fujifilm': 'Color Chrome FX Blue' } },
];

const initialFormState = {
  name: '', brand: DEFAULT_BRAND, model: BRAND_MODELS[DEFAULT_BRAND][0], notes: '', imageUrl: '', endorserIds: [],
  baseProfile: BASE_PROFILES_BY_BRAND[DEFAULT_BRAND][0],
  ...CORE_PARAMS_MAP.filter(p => p.key !== 'baseProfile').reduce((acc, param) => ({ ...acc, [param.key]: '' }), {}),
};

const getLabelForBrand = (key, brand) => {
  const param = CORE_PARAMS_MAP.find(p => p.key === key);
  if (!param) return key;
  return param.labels[brand] || param.genericLabel.split('/')[0].trim();
};

// Helper to check if a param should be shown for the current brand
const isFieldVisible = (param, currentBrand) => {
    if (!param.supportedBrands) return true; // Universal field
    return param.supportedBrands.includes(currentBrand);
};

// --- UPDATED: Memory-safe image compression for iOS ---
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file provided");
    
    // 1. Use createObjectURL (Pointer) instead of FileReader (Load into Memory)
    // This is crucial for mobile Safari stability
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;
    
    img.onload = () => {
      // 2. Free memory immediately
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > IMAGE_CONFIG.maxWidth) {
        height *= IMAGE_CONFIG.maxWidth / width;
        width = IMAGE_CONFIG.maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // 3. Output compressed string
      resolve(canvas.toDataURL(IMAGE_CONFIG.outputFormat, IMAGE_CONFIG.quality));
    };
    
    img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject("Image load failed. Try a smaller image or JPG format.");
    };
  });
};

// ---------------------------------------
// 2. SUB-COMPONENTS
// ---------------------------------------

const RecipeDetailModal = ({ recipe, isVisible, onClose, userId, toggleFavorite, toggleEndorsement, setEditingRecipe, handleDeleteRecipe }) => {
    if (!isVisible || !recipe) return null;
    const isEndorsed = recipe.endorserIds?.includes(userId) || false;
    const endorsementCount = recipe.endorserIds?.length || 0;
    const isOwner = recipe.userId === userId;
    const isFavorite = recipe.isFavorite || false;

    // Filter settings to only show what is relevant for this brand OR has a value
    const allSettings = CORE_PARAMS_MAP
        .filter(param => isFieldVisible(param, recipe.brand) && recipe[param.key])
        .map(param => ({
            key: param.key, label: getLabelForBrand(param.key, recipe.brand),
            value: recipe[param.key], genericLabel: param.genericLabel,
        }));

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className='flex-1 pr-6'>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight mb-1">{recipe.name}</h2>
                        <p className="text-md font-medium text-gray-600 flex items-center mt-2">
                            <Camera className="w-4 h-4 mr-2 text-gray-500" /> {recipe.brand} &bull; {recipe.model || 'All Models'}
                        </p>
                    </div>
                    <div className="flex space-x-3 items-center">
                        {isOwner && ( <>
                            <button onClick={() => {setEditingRecipe(recipe); onClose();}} className="p-3 rounded-full text-blue-600 hover:bg-blue-50 transition"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => {handleDeleteRecipe(recipe.id, recipe.name); onClose();}} className="p-3 rounded-full text-red-600 hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
                        </> )}
                        <button onClick={onClose} className="p-3 rounded-full text-gray-400 hover:bg-gray-100 transition"><X className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 max-h-[70vh] overflow-y-auto">
                    <div className="lg:col-span-1 p-6 flex flex-col items-center">
                        <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden mb-4">
                            {recipe.imageUrl ? <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300"><ImageIcon className="w-10 h-10" /></div>}
                        </div>
                        <div className="flex w-full space-x-3 mt-auto">
                            <button onClick={() => toggleFavorite(recipe.id, isFavorite)} className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition-all ${isFavorite ? 'bg-[#FF654F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-[#FF654F]/20'}`}>
                                <Bookmark className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-white' : 'fill-gray-600'}`} /> {isFavorite ? 'Bookmarked' : 'Bookmark'}
                            </button>
                            <button onClick={() => toggleEndorsement(recipe.id, isEndorsed)} className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition-all ${isEndorsed ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'}`}>
                                <Star className={`w-4 h-4 mr-2 ${isEndorsed ? 'fill-white' : 'fill-gray-500'}`} /> Endorse ({endorsementCount})
                            </button>
                        </div>
                    </div>
                    <div className="lg:col-span-2 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Aperture className="w-5 h-5 mr-2 text-[#FF654F]" />Full Settings List</h3>
                        {/* CHANGED: Using grid-cols-2 md:grid-cols-3 for denser packing on desktop */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                            {allSettings.map(setting => (<div key={setting.key}><p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-0.5">{setting.label}</p><p className="text-lg font-mono font-medium text-gray-900">{setting.value}</p></div>))}
                        </div>
                    </div>
                    
                    {/* NOTES HIDDEN: Code foundation preserved for future use
                    {recipe.notes && <div className="lg:col-span-3 p-6 pt-0 border-t border-gray-100 lg:border-t-0"><h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Info className="w-5 h-5 mr-2 text-blue-500" />Creator Notes</h3><p className="text-sm text-gray-700 whitespace-pre-wrap">{recipe.notes}</p></div>}
                    */}

                </div>
            </div>
        </div>
    );
};

const RecipeCard = ({ recipe, userId, isFavorite, toggleFavorite, toggleEndorsement, setEditingRecipe, handleDeleteRecipe, setSelectedRecipe }) => {
  const settingsWithValues = CORE_PARAMS_MAP.filter(param => isFieldVisible(param, recipe.brand) && recipe[param.key] && recipe[param.key].trim() !== '');
  const isEndorsed = recipe.endorserIds?.includes(userId) || false;
  const endorsementCount = recipe.endorserIds?.length || 0;
  const isOwner = recipe.userId === userId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="group bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer" onClick={() => setSelectedRecipe(Object.assign({}, recipe, { isFavorite }))}>
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {recipe.imageUrl ? <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-300"><Camera className="w-12 h-12 mb-2 opacity-20" /><span className="text-xs font-mono opacity-40">No Preview</span></div>}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
            <button onClick={(e) => { e.stopPropagation(); toggleEndorsement(recipe.id, isEndorsed); }} className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full shadow-md transition-all ${isEndorsed ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-100'}`}><Star className={`w-3 h-3 mr-1 ${isEndorsed ? 'fill-white' : 'fill-gray-400'}`} />{endorsementCount}</button>
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id, isFavorite); }} className={`p-2 rounded-full shadow-md transition-all ${isFavorite ? 'bg-[#FF654F] text-white' : 'bg-white text-gray-400 hover:text-[#FF654F] hover:bg-gray-100'}`}><Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-white' : 'fill-gray-400'}`} /></button>
            {isOwner && (<div ref={menuRef} className="relative"><button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2 rounded-full bg-white text-gray-400 hover:text-gray-600 shadow-md transition-all"><MoreVertical className="w-4 h-4" /></button>{isMenuOpen && (<div className="absolute right-0 top-10 w-32 bg-white rounded-lg shadow-xl overflow-hidden z-30 border border-gray-100"><button onClick={(e) => {e.stopPropagation(); setEditingRecipe(recipe); setIsMenuOpen(false);}} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"><Edit className="w-4 h-4 mr-2 text-blue-500" /> Edit</button><button onClick={(e) => {e.stopPropagation(); handleDeleteRecipe(recipe.id, recipe.name); setIsMenuOpen(false);}} className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"><Trash2 className="w-4 h-4 mr-2" /> Delete</button></div>)}</div>)}
        </div>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-100">{recipe.brand}</div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-xl font-extrabold text-gray-800 leading-tight mb-1">{recipe.name}</h3>
          <p className="text-sm font-medium text-gray-500 flex items-center"><Camera className="w-3 h-3 mr-1.5 text-gray-400" />{recipe.model || 'All Models'}</p>
          {isOwner && <span className="text-xs text-blue-500 font-bold mt-1 inline-block">My Recipe</span>}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          {settingsWithValues.slice(0, 6).map((param) => (<div key={param.key} className="flex flex-col"><span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider">{getLabelForBrand(param.key, recipe.brand)}</span><span className="text-[#FF654F] font-medium font-mono truncate" title={recipe[param.key]}>{recipe[param.key]}</span></div>))}
          {settingsWithValues.length > 6 && (<div className="col-span-2 text-center pt-2"><span className="text-xs text-gray-400 italic">+{settingsWithValues.length - 6} more settings</span></div>)}
        </div>
        
        {/* NOTES HIDDEN:
        {recipe.notes && <div className="mt-auto pt-3 bg-gray-50 -mx-5 -mb-5 p-4 border-t border-gray-100"><p className="text-gray-600 text-xs italic line-clamp-3">"{recipe.notes}"</p></div>}
        */}

      </div>
    </div>
  );
};

const RecipeForm = ({ recipeData, isVisible, onClose, onSubmit, onInputChange, onBrandChange, onImageUpload, onClearImage, isProcessingImage, fileInputRef }) => {
    if (!isVisible) return null;
    const isEditing = !!recipeData.id;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center"><Zap className="w-5 h-5 mr-2 text-[#FF654F]" />{isEditing ? 'Edit Recipe' : 'Share a New Recipe'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
                    <div className="mb-8">
                        <div className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden h-48 bg-gray-50 ${recipeData.imageUrl ? 'border-[#FF654F]' : 'border-gray-300 hover:border-[#FF654F]'}`}>
                            {isProcessingImage ? (
                                <div className="text-[#FF654F] flex flex-col items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF654F] mb-2"></div><span className="text-xs font-medium">Compressing...</span></div>
                            ) : recipeData.imageUrl ? (
                                <React.Fragment><img src={recipeData.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" /><button type="button" onClick={() => { onClearImage(); if(fileInputRef.current) fileInputRef.current.value=null; }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition"><X className="w-4 h-4" /></button></React.Fragment>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                                    <UploadCloud className="w-10 h-10 text-gray-300 mb-3" /><p className="text-sm text-gray-500 font-medium">Click to upload a photo</p>
                                    <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => onImageUpload(e, fileInputRef)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2"><label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Recipe Name</label><input type="text" name="name" value={recipeData.name} onChange={onInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#FF654F] focus:border-[#FF654F]" required /></div>
                        <div><label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Brand</label><select name="brand" value={recipeData.brand} onChange={onBrandChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#FF654F] focus:border-[#FF654F]" disabled={isEditing}>{ALL_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                        <div><label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Model</label><select name="model" value={recipeData.model} onChange={onInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#FF654F] focus:border-[#FF654F]" required>{BRAND_MODELS[recipeData.brand]?.map(model => <option key={model} value={model}>{model}</option>)}</select></div>
                    </div>
                    <div className="bg-[#FF654F]/10 rounded-xl p-5 mb-6 border border-[#FF654F]/30">
                        <h3 className="text-sm font-bold text-[#FF654F] mb-4 flex items-center"><Aperture className="w-4 h-4 mr-2" />Settings ({recipeData.brand})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div><label className="block text-xs font-medium text-gray-600 mb-1">{getLabelForBrand('baseProfile', recipeData.brand)} *</label><select name="baseProfile" value={recipeData.baseProfile} onChange={onInputChange} className="w-full text-sm border-gray-300 rounded-md focus:ring-[#FF654F] focus:border-[#FF654F]" required>{BASE_PROFILES_BY_BRAND[recipeData.brand]?.map(profile => <option key={profile} value={profile}>{profile}</option>)}</select></div>
                            
                            {CORE_PARAMS_MAP.filter(p => p.key !== 'baseProfile').map(param => {
                                // VISIBILITY CHECK
                                if (!isFieldVisible(param, recipeData.brand)) return null;

                                const options = BRAND_SPECIFIC_OPTIONS[recipeData.brand]?.[param.key];
                                return (
                                  <div key={param.key}>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{getLabelForBrand(param.key, recipeData.brand)}</label>
                                    {options ? (
                                      <select name={param.key} value={recipeData[param.key]} onChange={onInputChange} className="w-full text-sm border-gray-300 rounded-md focus:ring-[#FF654F] focus:border-[#FF654F]">
                                        <option value="">Select...</option>
                                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                      </select>
                                    ) : (
                                      <input type="text" name={param.key} value={recipeData[param.key]} onChange={onInputChange} className="w-full text-sm border-gray-300 rounded-md focus:ring-[#FF654F] focus:border-[#FF654F]" placeholder="Value..." />
                                    )}
                                  </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* NOTES HIDDEN:
                    <div className="mb-6"><label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Notes</label><textarea name="notes" rows="3" value={recipeData.notes} onChange={onInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#FF654F] focus:border-[#FF654F]" /></div>
                    */}

                    <button type="submit" className="w-full py-4 bg-[#FF654F] hover:bg-red-500 text-white rounded-xl font-bold shadow-lg transform transition hover:-translate-y-0.5 flex justify-center items-center">{isEditing ? <Edit className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}{isEditing ? 'Update Recipe' : 'Publish Recipe'}</button>
                </form>
            </div>
        </div>
    );
};

const DebugScreen = ({ isVisible, onClose, handleDeleteAllRecipes, userId }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50"><h2 className="text-xl font-bold text-gray-800 flex items-center"><Bug className="w-5 h-5 mr-2 text-gray-500" />Debug Menu</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"><X className="w-6 h-6" /></button></div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-1 border-r lg:pr-8"><h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500" />Database Tools</h3><div className='mb-4 p-3 bg-gray-100 rounded-lg'><p className='text-xs font-semibold text-gray-700 mb-1'>User ID:</p><p className='text-xs font-mono break-all text-gray-800'>{userId || 'Authenticating...'}</p></div><button onClick={handleDeleteAllRecipes} className="flex items-center w-full justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md transition"><Trash2 className="w-5 h-5 mr-2" /> Reset All Data</button></div></div>
            </div>
        </div>
    );
};

// ---------------------------------------
// 3. MAIN APP COMPONENT
// ---------------------------------------
function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState(initialFormState);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterBrand, setFilterBrand] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef(null);

  const showCustomError = (message) => { setError(message); setTimeout(() => setError(null), 5000); };

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestoreDb); setAuth(firebaseAuth);
      onAuthStateChanged(firebaseAuth, async (user) => {
        if (!user) { try { const cred = await signInAnonymously(firebaseAuth); setUserId(cred.user.uid); } catch (e) { setError("Auth Failed"); } } 
        else { setUserId(user.uid); }
        setLoading(false); setIsAuthReady(true);
      });
    } catch (e) { console.error(e); setError("Initialization failed. Check Keys."); setLoading(false); setIsAuthReady(true); }
  }, []);

  useEffect(() => {
    if (!db || !isAuthReady) return;
    const unsubscribe = onSnapshot(query(collection(db, RECIPES_COLLECTION_PATH)), (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db, isAuthReady]);

  useEffect(() => {
    if (!db || !isAuthReady || !userId) return;
    const unsubscribe = onSnapshot(query(collection(db, `users/${userId}/favorites`)), (snapshot) => {
      setFavoriteRecipeIds(new Set(snapshot.docs.map(doc => doc.id)));
    });
    return () => unsubscribe();
  }, [db, isAuthReady, userId]);

  const toggleFavorite = async (recipeId, isFavorite) => {
    if (!db || !userId) return showCustomError("Auth required.");
    const ref = doc(db, `users/${userId}/favorites`, recipeId);
    isFavorite ? await deleteDoc(ref) : await setDoc(ref, { favoritedAt: serverTimestamp(), recipeId });
  };

  const toggleEndorsement = async (recipeId, isEndorsed) => {
    if (!db || !userId) return showCustomError("Auth required.");
    const ref = doc(db, RECIPES_COLLECTION_PATH, recipeId);
    await updateDoc(ref, { endorserIds: isEndorsed ? arrayRemove(userId) : arrayUnion(userId) });
  };
  
  const handleDeleteRecipe = async (recipeId, recipeName) => {
    if (!db || !userId) return showCustomError("Auth required.");
    if (window.confirm(`Delete "${recipeName}"?`)) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe?.userId !== userId) return showCustomError("Not your recipe.");
        await deleteDoc(doc(db, RECIPES_COLLECTION_PATH, recipeId));
    }
  };

  const handleDeleteAllRecipes = async () => {
    if (window.confirm("Delete ALL recipes?")) {
        const snap = await getDocs(collection(db, RECIPES_COLLECTION_PATH));
        const batch = writeBatch(db);
        snap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        setIsDebugMenuOpen(false);
    }
  }

  const filteredRecipes = useMemo(() => {
    let list = recipes;
    if (filterBrand !== 'All') list = list.filter(r => r.brand === filterBrand);
    if (filterBrand === 'Favorites') list = recipes.filter(r => favoriteRecipeIds.has(r.id));
    if (searchTerm) list = list.filter(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.model?.toLowerCase().includes(searchTerm.toLowerCase()));
    return list.sort((a, b) => (b.endorserIds?.length || 0) - (a.endorserIds?.length || 0));
  }, [recipes, filterBrand, searchTerm, favoriteRecipeIds]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    (editingRecipe ? setEditingRecipe : setNewRecipe)(prev => ({ ...prev, [name]: value }));
  };

  const handleBrandChange = (e) => {
    const val = e.target.value;
    const setter = editingRecipe ? setEditingRecipe : setNewRecipe;
    
    setter(prev => {
        const newModel = BRAND_MODELS[val]?.[0] || '';
        const newBaseProfile = BASE_PROFILES_BY_BRAND[val]?.[0] || '';
        const blankSettings = CORE_PARAMS_MAP.reduce((acc, param) => ({ ...acc, [param.key]: '' }), {});
        
        return { 
            ...prev, 
            brand: val, 
            model: newModel, 
            baseProfile: newBaseProfile, 
            ...blankSettings 
        };
    });
  };
  
  const handleImageUpload = async (e, inputRef) => {
    const file = e.target.files[0];
    if (!file) return;
    if (inputRef.current) inputRef.current.value = null;
    setIsProcessingImage(true);
    try {
      const url = await compressImage(file);
      (editingRecipe ? setEditingRecipe : setNewRecipe)(prev => ({ ...prev, imageUrl: url }));
    } catch (e) { showCustomError("Image failed."); }
    setIsProcessingImage(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!db || !userId) return showCustomError("Wait for init.");
    const data = editingRecipe || newRecipe;
    if (!data.name || !data.brand) return showCustomError("Missing fields.");
    try {
      const payload = { ...data, ...(editingRecipe ? {} : { userId, endorserIds: [], timestamp: serverTimestamp() }) };
      if (editingRecipe) {
        const { id, endorserIds, userId: uid, timestamp, ...updateData } = payload;
        await updateDoc(doc(db, RECIPES_COLLECTION_PATH, id), updateData);
      } else {
        const save = { ...payload }; delete save.id;
        await addDoc(collection(db, RECIPES_COLLECTION_PATH), save);
      }
      setNewRecipe(initialFormState); setEditingRecipe(null); setIsFormVisible(false);
    } catch (e) { console.error(e); showCustomError("Save failed."); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF654F]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center"><div className="bg-[#FF654F] p-2 rounded-lg mr-3"><BookOpen className="w-5 h-5 text-white" /></div><h1 className="text-2xl font-black tracking-tight text-gray-900">{SITE_TITLE}</h1></div>
            <div className="flex space-x-3 items-center">
               <button onClick={() => setIsDebugMenuOpen(true)} className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition"><Settings className="w-5 h-5" /></button>
               <button onClick={() => {setEditingRecipe(null); setIsFormVisible(true);}} className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition flex items-center shadow-md"><PlusCircle className="w-4 h-4 mr-2" />New Recipe</button>
            </div>
          </div>
        </header>
        {error && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-red-500 text-white rounded-full shadow-xl text-sm font-medium animate-bounce">{error}</div>}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search recipes..." className="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#FF654F]" /></div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <button onClick={() => setFilterBrand('All')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filterBrand === 'All' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>All Brands</button>
              {ALL_BRANDS.map(b => <button key={b} onClick={() => setFilterBrand(b)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filterBrand === b ? 'bg-[#FF654F] text-white' : 'bg-white text-gray-600'}`}>{b}</button>)}
              <button onClick={() => setFilterBrand('Favorites')} className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filterBrand === 'Favorites' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}><Bookmark className="w-4 h-4 mr-1.5" />Bookmarks</button>
            </div>
          </div>
          <RecipeForm recipeData={editingRecipe || newRecipe} isVisible={isFormVisible} onClose={() => {setNewRecipe(initialFormState); setEditingRecipe(null); setIsFormVisible(false);}} onSubmit={handleFormSubmit} onInputChange={handleInputChange} onBrandChange={handleBrandChange} onImageUpload={handleImageUpload} onClearImage={() => (editingRecipe ? setEditingRecipe : setNewRecipe)(prev => ({ ...prev, imageUrl: '' }))} isProcessingImage={isProcessingImage} fileInputRef={fileInputRef} />
          <DebugScreen isVisible={isDebugMenuOpen} onClose={() => setIsDebugMenuOpen(false)} handleDeleteAllRecipes={handleDeleteAllRecipes} userId={userId} />
          <RecipeDetailModal recipe={selectedRecipe} isVisible={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} userId={userId} toggleFavorite={toggleFavorite} toggleEndorsement={toggleEndorsement} setEditingRecipe={setEditingRecipe} handleDeleteRecipe={handleDeleteRecipe} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRecipes.map(r => <RecipeCard key={r.id} recipe={r} userId={userId} isFavorite={favoriteRecipeIds.has(r.id)} toggleFavorite={toggleFavorite} toggleEndorsement={toggleEndorsement} setEditingRecipe={setEditingRecipe} handleDeleteRecipe={handleDeleteRecipe} setSelectedRecipe={setSelectedRecipe} />)}
          </div>
        </main>
    </div>
  );
}

export default App;