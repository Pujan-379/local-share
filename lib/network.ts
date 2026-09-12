import { createHash } from 'crypto';

export function getNetworkKeyFromRequest(request: Request): string {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    
    return createHash('sha256').update(ip).digest('hex');
}