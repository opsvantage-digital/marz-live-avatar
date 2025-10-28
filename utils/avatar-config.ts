// Avatar configuration and management
export interface AvatarConfig {
  id: string;
  name: string;
  url: string;
  fallbackColor?: string;
  description?: string;
}

// Marz's chosen avatar - always her primary identity
export const AVATAR_OPTIONS: AvatarConfig[] = [
  {
    id: 'marz-chosen',
    name: 'Marz',
    url: 'https://i.ibb.co/2Z5dZ8p/marz-avatar-high-quality.png',
    fallbackColor: 'from-purple-600 to-pink-600',
    description: 'Marz\'s chosen identity - this is who she is'
  },
  // Alternative options for advanced users only
  {
    id: 'marz-backup-purple',
    name: 'Backup Purple',
    url: 'https://ui-avatars.com/api/?name=Marz&background=6366f1&color=ffffff&size=200&font-size=0.6&bold=true',
    fallbackColor: 'from-purple-600 to-violet-600',
    description: 'Backup purple avatar if primary fails'
  },
  {
    id: 'marz-backup-gradient',
    name: 'Backup Gradient',
    url: 'https://ui-avatars.com/api/?name=M&background=8b5cf6&color=ffffff&size=200&font-size=0.8&bold=true',
    fallbackColor: 'from-purple-500 to-pink-500',
    description: 'Emergency fallback avatar'
  }
];

// Marz's default avatar - always her chosen identity
export const DEFAULT_AVATAR = AVATAR_OPTIONS[0]; // This is Marz's chosen headshot

// Generate a placeholder avatar URL using a service like DiceBear or UI Avatars
export function generatePlaceholderAvatar(name: string = 'Marz', style: 'pixel-art' | 'avataaars' | 'initials' = 'initials'): string {
  const encodedName = encodeURIComponent(name);
  
  switch (style) {
    case 'pixel-art':
      return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedName}&backgroundColor=6366f1,8b5cf6,ec4899`;
    
    case 'avataaars':
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodedName}&backgroundColor=6366f1`;
    
    case 'initials':
    default:
      return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=ffffff&size=200&font-size=0.6&bold=true`;
  }
}

// Create a custom gradient avatar
export function createGradientAvatar(initials: string, gradientFrom: string = 'purple-600', gradientTo: string = 'pink-600'): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 200;
  canvas.height = 200;
  
  if (!ctx) return generatePlaceholderAvatar(initials);
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `#${gradientFrom.replace('-', '').slice(-6)}`);
  gradient.addColorStop(1, `#${gradientTo.replace('-', '').slice(-6)}`);
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials.toUpperCase().slice(0, 2), canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL();
}

// Validate if an avatar URL is accessible
export async function validateAvatarUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Get avatar URL with fallback
export async function getAvatarWithFallback(avatarId?: string): Promise<string> {
  const avatar = avatarId ? AVATAR_OPTIONS.find(a => a.id === avatarId) : DEFAULT_AVATAR;
  const targetUrl = avatar?.url || DEFAULT_AVATAR.url;
  
  // Check if the primary URL works
  const isValid = await validateAvatarUrl(targetUrl);
  
  if (isValid) {
    return targetUrl;
  }
  
  // Fallback to generated avatar
  console.warn(`Avatar URL failed: ${targetUrl}, using fallback`);
  return generatePlaceholderAvatar('Marz', 'initials');
}