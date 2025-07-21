/**
 * Simple test for FontUtils functionality
 * This is a basic verification that can be run in the browser console
 */

import { FontUtils } from './FontUtils';

export function testFontUtils(): void {
  console.log('=== FontUtils Test ===');
  
  const fontUtils = FontUtils.getInstance();
  
  // Test 1: Check singleton pattern
  const fontUtils2 = FontUtils.getInstance();
  console.log('Singleton test:', fontUtils === fontUtils2 ? 'PASS' : 'FAIL');
  
  // Test 2: Check font constants
  console.log('Title font constant:', FontUtils.TITLE_FONT);
  console.log('UI font constant:', FontUtils.UI_FONT);
  
  // Test 3: Check initial font loading status
  console.log('Initial font loading status:', fontUtils.getFontLoadingStatus());
  
  // Test 4: Check fallback font families
  console.log('Title font family (with fallback):', fontUtils.getTitleFont());
  console.log('UI font family (with fallback):', fontUtils.getUIFont());
  
  // Test 5: Check if all fonts are loaded initially (should be false)
  console.log('All fonts loaded initially:', fontUtils.areAllFontsLoaded() ? 'UNEXPECTED' : 'EXPECTED');
  
  console.log('=== FontUtils Test Complete ===');
}

// Export for browser console testing
(window as any).testFontUtils = testFontUtils;