/**
 * PAI Identity Configuration - Single Source of Truth
 *
 * This module provides consistent identity configuration across all PAI hooks.
 * It handles environment variable detection with sensible defaults.
 *
 * Pattern: Mirrors pai-paths.ts exactly (process.env with || fallback)
 *
 * Usage in hooks:
 *   import { USER_NAME, AGENT_NAME, VOICE_ID } from './lib/pai-identity';
 *   import { getUserEmail, validateCoreIdentity } from './lib/pai-identity';
 */

/**
 * Core Identity - REQUIRED
 *
 * Priority:
 * 1. PAI_USER_NAME environment variable (if set in settings.json env block)
 * 2. "User" (generic default for forks)
 */
export const USER_NAME = process.env.PAI_USER_NAME?.trim() || 'User';
export const USER_FIRST_NAME = USER_NAME.split(' ')[0];

/**
 * Agent/Assistant Name
 *
 * Priority:
 * 1. PAI_AGENT_NAME environment variable (if set)
 * 2. DA environment variable (backward compatibility)
 * 3. "Assistant" (generic default for forks)
 */
export const AGENT_NAME = process.env.PAI_AGENT_NAME?.trim() ||
                         process.env.DA?.trim() ||
                         'Assistant';

/**
 * Extended Identity Fields - OPTIONAL
 *
 * These fields are optional and render as empty strings if not configured.
 * Used for extended personalization in identity.md templates.
 */
export const USER_EMAIL = process.env.PAI_USER_EMAIL?.trim() || '';
export const USER_LOCATION_CITY = process.env.PAI_USER_LOCATION_CITY?.trim() || '';
export const USER_LOCATION_COUNTRY = process.env.PAI_USER_LOCATION_COUNTRY?.trim() || '';
export const USER_TIMEZONE = process.env.PAI_USER_TIMEZONE?.trim() || '';
export const USER_ROLE = process.env.PAI_USER_ROLE?.trim() || '';
export const USER_ORGANIZATION = process.env.PAI_USER_ORGANIZATION?.trim() || '';

/**
 * Voice Configuration - OPTIONAL
 *
 * Priority:
 * 1. PAI_VOICE_ID environment variable (if set)
 * 2. DA_VOICE_ID environment variable (backward compatibility)
 * 3. '' (empty string, no default voice)
 */
export const VOICE_ID = process.env.PAI_VOICE_ID?.trim() ||
                       process.env.DA_VOICE_ID?.trim() ||
                       '';

/**
 * Helpers for conditional rendering in templates
 */

export function getUserEmail(): string {
  return USER_EMAIL;
}

export function getUserLocation(): string {
  if (USER_LOCATION_CITY && USER_LOCATION_COUNTRY) {
    return `${USER_LOCATION_CITY}, ${USER_LOCATION_COUNTRY}`;
  }
  return USER_LOCATION_CITY || USER_LOCATION_COUNTRY || '';
}

export function hasUserEmail(): boolean {
  return !!USER_EMAIL;
}

export function hasUserLocation(): boolean {
  return !!(USER_LOCATION_CITY || USER_LOCATION_COUNTRY);
}

export function hasUserTimezone(): boolean {
  return !!USER_TIMEZONE;
}

export function hasUserRole(): boolean {
  return !!USER_ROLE;
}

export function hasUserOrganization(): boolean {
  return !!USER_ORGANIZATION;
}

/**
 * Validation: Warn if core identity not configured
 *
 * This provides helpful guidance to new users who fork PAI.
 * Does NOT exit (graceful degradation) - system works with defaults.
 */
export function validateCoreIdentity(): void {
  if (USER_NAME === 'User' || AGENT_NAME === 'Assistant') {
    console.error('⚠️  PAI Identity not configured - using generic defaults');
    console.error('   To personalize:');
    console.error('   1. Add PAI_USER_NAME and PAI_AGENT_NAME to ~/.claude/settings.json env block');
    console.error('   2. See ~/.claude/.env.example for all available configuration options');
    console.error('   3. Restart Claude Code for changes to take effect');
  }
}
